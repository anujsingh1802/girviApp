import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL, { API_ENDPOINTS } from '../api';

const AddLoan = ({ navigateTo }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    itemName: '',
    category: 'Gold',
    description: '',
    estimatedValue: '',
    loanAmount: '',
    disbursedAmount: '',
    interestRate: '',
    duration: '3',
    durationUnit: 'months',
    interestType: 'simple',
    loanDate: new Date().toISOString().slice(0, 10),
    netWeight: '',
    grossWeight: ''
  });

  useEffect(() => {
    let isMounted = true;
    const loadCustomers = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CUSTOMERS);
        const data = await res.json();
        if (isMounted) {
          setCustomers(Array.isArray(data.customers) ? data.customers : []);
        }
      } catch (err) {
        if (isMounted) setCustomers([]);
      } finally {
        if (isMounted) setLoadingCustomers(false);
      }
    };
    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      id: c._id,
      label: `${c.name} • ${c.phone || "NA"}`,
    }));
  }, [customers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc('item');
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setItemImageUrl(result.url);
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploadingDoc('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerId, itemName, category, description, estimatedValue, loanAmount, interestRate, duration, durationUnit, interestType, loanDate, netWeight, grossWeight } = formData;
    if (!customerId || !itemName || !loanAmount || !interestRate || !duration) {
      alert("Please fill all required fields (*)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId,
        itemName,
        category,
        description,
        images: itemImageUrl ? [itemImageUrl] : [],
        estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
        loanAmount: Number(loanAmount),
        disbursedAmount: formData.disbursedAmount ? Number(formData.disbursedAmount) : Number(loanAmount),
        interestRate: Number(interestRate),
        duration: Number(duration),
        durationUnit,
        interestType,
        loanDate,
        netWeight: netWeight ? Number(netWeight) : undefined,
        grossWeight: grossWeight ? Number(grossWeight) : undefined
      };

      const res = await fetch(API_ENDPOINTS.LOAN_APPLY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Loan created successfully!");
        navigateTo('home');
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      alert("Failed to create loan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('home')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">New Loan</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto pb-6 max-w-5xl mx-auto w-full">
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-borderBase shadow-sm">
          <h4 className="text-lg font-bold text-textMain mb-6 border-b border-borderBase pb-3">Loan Details</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMain mb-2">Customer *</label>
              <select name="customerId" value={formData.customerId} onChange={handleChange} className="input-field">
                <option value="">{loadingCustomers ? "Loading customers..." : "Select customer"}</option>
                {customerOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Item Name *</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Gold Necklace" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                <option>Gold</option>
                <option>Silver</option>
                <option>Platinum</option>
                <option>Diamond</option>
                <option>Vehicle</option>
                <option>Electronics</option>
                <option>Property</option>
                <option>Other</option>
              </select>
            </div>

            {['Gold', 'Silver', 'Platinum'].includes(formData.category) && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-2">Net Weight (gm)</label>
                  <input type="number" step="any" name="netWeight" value={formData.netWeight} onChange={handleChange} placeholder="e.g. 10.5" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-2">Gross Weight (gm)</label>
                  <input type="number" step="any" name="grossWeight" value={formData.grossWeight} onChange={handleChange} placeholder="e.g. 12" className="input-field" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Estimated Value</label>
              <input type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleChange} placeholder="50000" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Loan Amount *</label>
              <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} placeholder="30000" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Disbursed Amount (Cash Given)</label>
              <input type="number" name="disbursedAmount" value={formData.disbursedAmount} onChange={handleChange} placeholder={formData.loanAmount || "29900"} className="input-field bg-background border-dashed" />
              <p className="text-[11px] text-textMuted mt-1">Leave empty to use exact Loan Amount. Lower it to account for processing fees.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Interest Rate (%) *</label>
              <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} placeholder="12" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Interest Type *</label>
              <select name="interestType" value={formData.interestType} onChange={handleChange} className="input-field">
                <option value="simple">Simple</option>
                <option value="compound">Compound</option>
                <option value="monthly">Monthly Flat</option>
                <option value="daily">Daily Flat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Loan Date *</label>
              <input type="date" name="loanDate" value={formData.loanDate} onChange={handleChange} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Duration *</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="3" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Duration Unit *</label>
              <select name="durationUnit" value={formData.durationUnit} onChange={handleChange} className="input-field">
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMain mb-2">Item Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Notes about the item..." rows="3" className="input-field resize-none"></textarea>
            </div>

            <div className="md:col-span-2">
              <span className="block text-sm font-semibold text-textMain mb-2">Upload Item Photo</span>
              <div className="border-2 border-dashed border-borderBase rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-textMuted bg-background cursor-pointer hover:border-primary transition-colors h-32 relative overflow-hidden">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {uploadingDoc === 'item' ? (
                  <span className="font-medium text-sm text-primary">Uploading...</span>
                ) : itemImageUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={itemImageUrl} alt="Item" className="w-16 h-16 object-cover rounded-md border border-borderBase shadow-sm" />
                    <div className="flex flex-col">
                      <span className="icon text-green-500 text-2xl">check_circle</span>
                      <span className="font-medium text-sm text-green-500">Uploaded</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="icon text-primary text-3xl">add_a_photo</span> 
                    <span className="font-medium text-sm">Click to upload item photo</span>
                  </>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={submitting} className="btn bg-primary-dark text-white rounded-xl font-bold shadow-md hover:bg-primary py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Saving..." : "Create Loan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLoan;

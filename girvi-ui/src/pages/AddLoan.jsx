import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL, { API_ENDPOINTS } from '../api';

const AddLoan = ({ navigateTo }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState(null);
  
  const [items, setItems] = useState([{
    itemName: '',
    category: 'Gold',
    description: '',
    estimatedValue: '',
    netWeight: '',
    grossWeight: '',
    images: [] // Array of image URLs
  }]);

  const [formData, setFormData] = useState({
    customerId: '',
    loanAmount: '',
    disbursedAmount: '',
    interestRate: '',
    duration: '3',
    durationUnit: 'months',
    interestType: 'simple',
    loanDate: new Date().toISOString().slice(0, 10),
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

  const handleFileUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDocIndex(index);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        const newItems = [...items];
        newItems[index].images = [result.url];
        setItems(newItems);
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setUploadingDocIndex(null);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  const addNewItem = () => {
    setItems([...items, {
      itemName: '',
      category: 'Gold',
      description: '',
      estimatedValue: '',
      netWeight: '',
      grossWeight: '',
      images: []
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerId, loanAmount, interestRate, duration, durationUnit, interestType, loanDate } = formData;
    
    if (!customerId || !loanAmount || !interestRate || !duration) {
      alert("Please fill all required loan fields (*)");
      return;
    }

    const hasInvalidItem = items.some(i => !i.itemName || !i.category);
    if (hasInvalidItem) {
        alert("Please ensure all items have a name and category.");
        return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId,
        loanAmount: Number(loanAmount),
        disbursedAmount: formData.disbursedAmount ? Number(formData.disbursedAmount) : Number(loanAmount),
        interestRate: Number(interestRate),
        duration: Number(duration),
        durationUnit,
        interestType,
        loanDate,
        items: items.map(i => ({
          ...i,
          estimatedValue: i.estimatedValue ? Number(i.estimatedValue) : undefined,
          netWeight: i.netWeight ? Number(i.netWeight) : undefined,
          grossWeight: i.grossWeight ? Number(i.grossWeight) : undefined
        }))
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

            <div className="md:col-span-2 mt-4 relative">
              <div className="flex items-center justify-between border-b border-borderBase pb-3 mb-4">
                <h4 className="text-lg font-bold text-textMain">Collateral Items</h4>
                <button type="button" onClick={addNewItem} className="text-sm font-bold bg-primary-light/20 text-primary-dark px-4 py-2 rounded-lg hover:bg-primary-light/40 flex items-center gap-1 transition-colors">
                  <span className="icon text-base">add</span> Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="bg-background p-5 rounded-xl border border-borderBase mb-4 relative shadow-sm">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors">
                      <span className="icon text-xl text-red-500">close</span>
                    </button>
                  )}
                  <h5 className="font-semibold text-textMain mb-4 flex items-center gap-2">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                    Item Detail
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-textMain mb-2">Item Name *</label>
                      <input type="text" name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} placeholder="Gold Necklace" className="input-field" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-textMain mb-2">Category *</label>
                      <select name="category" value={item.category} onChange={(e) => handleItemChange(index, e)} className="input-field">
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

                    {['Gold', 'Silver', 'Platinum'].includes(item.category) && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-textMain mb-2">Net Weight (gm)</label>
                          <input type="number" step="any" name="netWeight" value={item.netWeight} onChange={(e) => handleItemChange(index, e)} placeholder="e.g. 10.5" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-textMain mb-2">Gross Weight (gm)</label>
                          <input type="number" step="any" name="grossWeight" value={item.grossWeight} onChange={(e) => handleItemChange(index, e)} placeholder="e.g. 12" className="input-field" />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-textMain mb-2">Estimated Value</label>
                      <input type="number" name="estimatedValue" value={item.estimatedValue} onChange={(e) => handleItemChange(index, e)} placeholder="50000" className="input-field" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-textMain mb-2">Item Description</label>
                      <textarea name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} placeholder="Notes about the item..." rows="2" className="input-field resize-none"></textarea>
                    </div>

                    <div className="md:col-span-2 mt-2">
                      <span className="block text-sm font-semibold text-textMain mb-2">Upload Photo (Optional)</span>
                      <div className="border-2 border-dashed border-borderBase rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-textMuted bg-card cursor-pointer hover:border-primary transition-colors h-24 relative overflow-hidden">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(index, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        {uploadingDocIndex === index ? (
                          <span className="font-medium text-sm text-primary">Uploading...</span>
                        ) : item.images.length > 0 ? (
                          <div className="flex items-center gap-4">
                            <img src={item.images[0]} alt="Item" className="w-12 h-12 object-cover rounded-md border border-borderBase shadow-sm" />
                            <div className="flex flex-col">
                              <span className="icon text-green-500 text-lg">check_circle</span>
                              <span className="font-medium text-[11px] text-green-500">Uploaded</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="icon text-primary text-2xl">add_a_photo</span> 
                            <span className="font-medium text-xs">Click to upload photo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 pt-4 border-t border-borderBase">
                <h4 className="text-lg font-bold text-textMain mb-4">Financial Details</h4>
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Loan Amount *</label>
              <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} placeholder="30000" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Disbursed Amount</label>
              <input type="number" name="disbursedAmount" value={formData.disbursedAmount} onChange={handleChange} placeholder={formData.loanAmount || "29900"} className="input-field bg-background border-dashed" />
              <p className="text-[11px] text-textMuted mt-1">Lower this if deducting fees initialy.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Interest Rate (%) *</label>
              <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} placeholder="12" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Interest Type *</label>
              <select name="interestType" value={formData.interestType} onChange={handleChange} className="input-field">
                <option value="emi">EMI (Equated Monthly Installment)</option>
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

            <div className="md:col-span-2 flex justify-end mt-4">
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

import React, { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../api';

const AddPayment = ({ navigateTo }) => {
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    loanId: '',
    amount: '',
    releaseDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    let isMounted = true;
    const loadLoans = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.LOANS_ALL);
        const data = await res.json();
        if (isMounted) {
          setLoans(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) setLoans([]);
      } finally {
        if (isMounted) setLoadingLoans(false);
      }
    };
    loadLoans();
    return () => {
      isMounted = false;
    };
  }, []);

  const loanOptions = useMemo(() => {
    return loans.map((l) => {
      const itemsText = l.items && l.items.length > 0
        ? l.items.map(i => i.itemName).join(', ')
        : (l.itemId?.itemName || "Item");
      const dateText = new Date(l.loanDate || l.createdAt).toLocaleDateString();
      return {
        id: l._id,
        label: `${l.userId?.name || "Customer"} • ₹${l.loanAmount} • ${itemsText} • ${dateText}`,
      };
    });
  }, [loans]);

  const selectedLoan = useMemo(() => loans.find((l) => l._id === formData.loanId), [loans, formData.loanId]);

  const interestBreakdown = useMemo(() => {
    if (!selectedLoan) return null;
    const principal = Number(selectedLoan.loanAmount || 0);
    const monthlyRate = Number(selectedLoan.interestRate || 0) / 100;
    const startDate = new Date(selectedLoan.loanDate || selectedLoan.startDate || selectedLoan.createdAt);
    const endDate = new Date(formData.releaseDate);
    if (!principal || !monthlyRate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { interest: 0, total: principal };
    }
    const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const fullMonths = Math.floor(diffDays / 30);
    const extraDays = diffDays % 30;
    const monthlyInterest = principal * monthlyRate;
    const interest = (monthlyInterest * fullMonths) + (monthlyInterest * (extraDays / 30));
    const roundedInterest = Math.round(interest * 100) / 100;
    const total = Math.round((principal + roundedInterest) * 100) / 100;
    return { interest: roundedInterest, total, fullMonths, extraDays };
  }, [selectedLoan, formData.releaseDate]);

  const paidSoFar = Number(selectedLoan?.paidTotal || 0);
  const remainingBefore = interestBreakdown ? Math.max(0, Math.round((interestBreakdown.total - paidSoFar) * 100) / 100) : 0;
  const remainingAfter = interestBreakdown ? Math.max(0, Math.round((remainingBefore - Number(formData.amount || 0)) * 100) / 100) : 0;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { loanId, amount, releaseDate } = formData;
    if (!loanId || !amount) {
      alert("Please fill all required fields (*)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.PAYMENT_PUBLIC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId, amount: Number(amount), releaseDate }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Payment recorded successfully!");
        navigateTo('home');
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      alert("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-t-[40px] lg:rounded-t-[32px] overflow-hidden">
      <div className="bg-primary text-white px-6 py-5 md:py-6 flex items-center gap-4 sticky top-0 z-20 shadow-md">
        <span className="icon cursor-pointer hover:bg-white/20 p-2 rounded-full transition-colors" onClick={() => navigateTo('home')}>arrow_back</span>
        <h2 className="text-xl md:text-2xl font-semibold">New Payment</h2>
      </div>

      <div className="view-padding py-8 flex-1 overflow-y-auto pb-6 max-w-5xl mx-auto w-full">
        <div className="bg-card p-6 md:p-8 rounded-2xl border border-borderBase shadow-sm">
          <h4 className="text-lg font-bold text-textMain mb-6 border-b border-borderBase pb-3">Payment Details</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-textMain mb-2">Loan *</label>
              <select name="loanId" value={formData.loanId} onChange={handleChange} className="input-field">
                <option value="">{loadingLoans ? "Loading loans..." : "Select loan"}</option>
                {loanOptions.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            {selectedLoan && (
            <div className="md:col-span-2 bg-background border border-borderBase rounded-xl p-4 text-sm text-textMuted">
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="text-textMain font-semibold">{selectedLoan.userId?.name || "-"}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Loan Amount</span>
                  <span className="text-textMain font-semibold">₹{selectedLoan.loanAmount}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Status</span>
                  <span className="text-textMain font-semibold capitalize">{selectedLoan.status}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span>Loan Date</span>
                  <span className="text-textMain font-semibold">
                    {selectedLoan.loanDate ? new Date(selectedLoan.loanDate).toLocaleDateString() : new Date(selectedLoan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {interestBreakdown && (
                  <>
                    <div className="flex justify-between mt-2">
                      <span>Interest Accrued</span>
                      <span className="text-textMain font-semibold">₹{interestBreakdown.interest}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Total Payable</span>
                      <span className="text-textMain font-semibold">₹{interestBreakdown.total}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Paid So Far</span>
                      <span className="text-textMain font-semibold">₹{paidSoFar}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Remaining (before payment)</span>
                      <span className="text-textMain font-semibold">₹{remainingBefore}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span>Remaining (after this payment)</span>
                      <span className="text-textMain font-semibold">₹{remainingAfter}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400">
                      Based on {interestBreakdown.fullMonths} full months + {interestBreakdown.extraDays} extra days (30‑day month).
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Payment Amount *</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="5000" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">Release Date *</label>
              <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="input-field" />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={submitting} className="btn bg-primary-dark text-white rounded-xl font-bold shadow-md hover:bg-primary py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPayment;

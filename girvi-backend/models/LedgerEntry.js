const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // girvi uses User for customers
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', default: null },
    transactionRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    amount: { type: Number, required: true },
    transactionDate: { type: Date, required: true },
    description: { type: String, default: '' },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    source: { type: String, enum: ['manual', 'loan-disbursement', 'loan-payment'], default: 'manual' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);

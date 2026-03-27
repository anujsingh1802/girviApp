const LedgerEntry = require('../models/LedgerEntry');

async function getLastBalance() {
  const lastEntry = await LedgerEntry.findOne().sort({ transactionDate: -1, createdAt: -1 }).lean();
  return Number(lastEntry?.balance || 0);
}

async function createLedgerRecord({
  customer = null,
  loan = null,
  transactionRef = null,
  transactionDate = new Date(),
  description = '',
  debit = 0,
  credit = 0,
  source = 'manual',
}) {
  const openingBalance = await getLastBalance();
  const balance = Number((openingBalance + Number(credit || 0) - Number(debit || 0)).toFixed(2));

  return LedgerEntry.create({
    customer,
    loan,
    transactionRef,
    transactionDate,
    description,
    debit: Number(debit || 0),
    credit: Number(credit || 0),
    amount: Number(credit || debit || 0),
    type: Number(credit || 0) > 0 ? 'credit' : 'debit',
    balance,
    source,
  });
}

module.exports = { createLedgerRecord };

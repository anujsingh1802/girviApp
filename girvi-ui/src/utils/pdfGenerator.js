import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePaymentReceipt = (paymentData) => {
  const { transaction, loan } = paymentData;
  const doc = new jsPDF();

  // Add Company Logo/Header
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.text('GIRVI APP', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Payment Receipt', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt ID: ${transaction._id}`, 105, 36, { align: 'center' });
  const dateStr = new Date(transaction.createdAt).toLocaleString();
  doc.text(`Date: ${dateStr}`, 105, 42, { align: 'center' });

  // Divider
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);

  // Customer & Loan Details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Customer Details', 14, 58);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Name: ${loan.userId?.name || 'N/A'}`, 14, 66);
  doc.text(`Phone: ${loan.userId?.phone || 'N/A'}`, 14, 72);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Loan Details', 120, 58);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Principal Amount: Rs. ${loan.loanAmount}`, 120, 66);
  doc.text(`Status: ${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}`, 120, 72);

  // Table for Payment Breakdown
  const tableData = [
    ['Payment Amount', `Rs. ${transaction.amount}`],
    ['Paid On', new Date(transaction.createdAt).toLocaleDateString()],
    ['Interest Type', loan.interestType ? loan.interestType.charAt(0).toUpperCase() + loan.interestType.slice(1) : 'Simple'],
    ['Updated Total Payable', `Rs. ${loan.totalPayable || 'N/A'}`]
  ];

  doc.autoTable({
    startY: 85,
    head: [['Description', 'Details']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 }
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 130;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });
  doc.text('This is a computer generated receipt and does not require a physical signature.', 105, finalY + 26, { align: 'center' });

  // Download
  doc.save(`Receipt_${transaction._id}.pdf`);
};

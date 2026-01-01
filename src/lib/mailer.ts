import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendLowStockEmail({
  itemName,
  quantity,
  requesterName,
  approveUrl,
  rejectUrl,
}: {
  itemName: string;
  quantity: number;
  requesterName: string;
  approveUrl: string;
  rejectUrl: string;
}) {
  await transporter.sendMail({
    from: `"ScienceMate System" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `Low Stock Approval Required: ${itemName}`,
    html: `
      <p>Dear Sir/Madam,</p>
      <p>A request has been submitted due to low stock levels.</p>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr><td><b>Item</b></td><td>${itemName}</td></tr>
        <tr><td><b>Requested Quantity</b></td><td>${quantity}</td></tr>
        <tr><td><b>Requested By</b></td><td>${requesterName}</td></tr>
      </table>
      <a href="${approveUrl}">✅ Approve</a>
      <br/><br/>
      <a href="${rejectUrl}">❌ Reject</a>
      <p>Please log in to the system to approve or reject this request.</p>
      <p>Regards,<br/>ScienceMate Inventory System</p>
    `,
  });
}

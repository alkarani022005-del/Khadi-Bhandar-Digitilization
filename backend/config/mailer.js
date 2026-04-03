require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
});

transporter.verify((err) => {
  if (err) console.log('❌ Mailer Error:', err.message);
  else console.log('✅ Mailer ready');
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Banasthali Khadi Bhandar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP - Banasthali Khadi Bhandar',
    html: `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;">
        <div style="background:#000;padding:20px;text-align:center;">
          <h2 style="color:#fff;margin:0;">BANASTHALI KHADI BHANDAR</h2>
        </div>
        <div style="background:#fce4ec;padding:40px;text-align:center;">
          <h3>Your One-Time Password</h3>
          <div style="background:#fff;border:2px dashed #e91e63;border-radius:12px;padding:20px;display:inline-block;margin:20px 0;">
            <span style="font-size:40px;font-weight:bold;color:#e91e63;letter-spacing:10px;">${otp}</span>
          </div>
          <p style="color:#666;">Valid for <strong>10 minutes</strong></p>
        </div>
        <div style="background:#111;padding:15px;text-align:center;">
          <p style="color:#aaa;margin:0;font-size:12px;">© 2024 Banasthali Khadi Bhandar</p>
        </div>
      </div>`,
  });
};

const sendOrderEmail = async (email, name, order) => {
  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${(i.price * i.quantity).toLocaleString()}</td>
    </tr>`).join('');

  await transporter.sendMail({
    from: `"Banasthali Khadi Bhandar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} — Banasthali Khadi Bhandar`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto;">
        <div style="background:#000;padding:20px;text-align:center;">
          <h2 style="color:#fff;margin:0;">BANASTHALI KHADI BHANDAR</h2>
        </div>
        <div style="background:#fce4ec;padding:24px;">
          <h2 style="color:#e91e63;">🎉 Order Confirmed!</h2>
          <p>Hi <strong>${name}</strong>, your order has been placed successfully.</p>
          <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;">
            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px;text-align:left;">Item</th>
                <th style="padding:10px;text-align:center;">Qty</th>
                <th style="padding:10px;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:10px;text-align:right;font-weight:bold;">Total:</td>
                <td style="padding:10px;text-align:right;font-weight:bold;color:#e91e63;">₹${order.totalPrice.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;">
            <p><strong>📍 Deliver to:</strong></p>
            <p>${order.shippingAddress.name}<br/>
            ${order.shippingAddress.street}, ${order.shippingAddress.city}<br/>
            ${order.shippingAddress.state} — ${order.shippingAddress.pincode}</p>
          </div>
        </div>
        <div style="background:#111;padding:15px;text-align:center;">
          <p style="color:#aaa;margin:0;font-size:12px;">© 2024 Banasthali Khadi Bhandar</p>
        </div>
      </div>`,
  });
};

const sendStatusEmail = async (email, name, order) => {
  const statusMessages = {
    Confirmed: { emoji: '✅', msg: 'Your order has been confirmed and is being prepared.' },
    Shipped: { emoji: '🚚', msg: 'Your order is on its way! Track it using the order ID.' },
    Delivered: { emoji: '🎉', msg: 'Your order has been delivered. Enjoy your Khadi products!' },
    Cancelled: { emoji: '❌', msg: 'Your order has been cancelled. Refund will be processed in 5-7 days.' },
  };

  const s = statusMessages[order.status] || { emoji: '📦', msg: `Order status: ${order.status}` };

  await transporter.sendMail({
    from: `"Banasthali Khadi Bhandar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${s.emoji} Order ${order.status} — #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial;max-width:500px;margin:0 auto;">
        <div style="background:#000;padding:20px;text-align:center;">
          <h2 style="color:#fff;margin:0;">BANASTHALI KHADI BHANDAR</h2>
        </div>
        <div style="background:#fce4ec;padding:40px;text-align:center;">
          <div style="font-size:60px;">${s.emoji}</div>
          <h2 style="color:#e91e63;">Order ${order.status}!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>${s.msg}</p>
          <div style="background:#fff;border-radius:8px;padding:16px;margin:20px 0;text-align:left;">
            <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p><strong>Total:</strong> ₹${order.totalPrice.toLocaleString()}</p>
          </div>
        </div>
        <div style="background:#111;padding:15px;text-align:center;">
          <p style="color:#aaa;margin:0;font-size:12px;">© 2024 Banasthali Khadi Bhandar</p>
        </div>
      </div>`,
  });
};

module.exports = { sendOtpEmail, sendOrderEmail, sendStatusEmail };
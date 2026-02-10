import nodemailer from "nodemailer";

// Create a transporter that send email request to SMTP server of SMTP provider (.e.g Gmail, SendGrid,...)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"Jin Store" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to Jin Store 🎉",
    html: `
      <h2>Hello ${name ?? "there"} 👋</h2>
      <p>Your account has been created successfully.</p>
      <p>Enjoy shopping with us!</p>
    `,
  });
};

const sendVerifyEmail = async (email, token) => {
  const verifyUrl = `${process.env.APP_BASE_URL}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Jin Store" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Verify your account",
    html: `
      <h3>Welcome!</h3>
      <p>Please click the link below to verify your account:</p>
      <a href="${verifyUrl}">Verify your account</a>
      <p>This link will expire in 30 minutes.</p>
    `,
  });
};

const sendResetPasswordEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"Jin Store" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Reset password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset your password</a>
      <p>This link will expire in 1 minute.</p>
    `,
  });
};

export { sendWelcomeEmail, sendVerifyEmail, sendResetPasswordEmail };

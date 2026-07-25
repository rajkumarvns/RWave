import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || process.env.GMAIL_USERNAME,
      pass: process.env.EMAIL_PASS || process.env.GMAIL_PASSCODE,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `"RWave App" <${process.env.EMAIL_USER || process.env.GMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendVerificationEmail(user, token) {
  // use `http://localhost:3000/user/verify/${token}` while running locally 
  const verificationUrl = `https://appending.vercel.app/user/verify/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Email Verification",
    text: `Click the following link to verify your email: ${verificationUrl}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
}

module.exports = { sendVerificationEmail };

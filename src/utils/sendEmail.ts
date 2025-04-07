import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
	path: "./.env",
});

//Debugging
console.log("Loaded environment variables:");
console.log("ID:", process.env.ID);
console.log("PASSWORD:", process.env.PASSWORD);

const transporter = nodemailer.createTransport({
	host: 'smtp.ethereal.email',
	port: 587,
	secure: false,
	auth: {
			user: process.env.ID,
			pass: process.env.PASSWORD
	}
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP transporter verification failed:", error);
  } else {
    console.log("SMTP transporter is ready to send emails:", success);
  }
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: '"ProxyPapi" <no-reply@proxypapi.com>', // Sender address
    to, // List of recipients
    subject, // Subject line
    text, // Plain text body
  };

	try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

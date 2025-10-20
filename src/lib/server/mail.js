import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,            // 465 = SSL (secure: true)
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,      // your@gmail.com
    pass: process.env.EMAIL_SERVER_PASSWORD,  // app password 16 karakter
  },
  family: 4, // paksa IPv4 agar tidak ke ::1
});

transporter.verify().then(() => {
  console.log('SMTP OK');
}).catch(err => {
  console.error('SMTP error:', err);
});


// Generic sendMail function
export const sendMail = async (options) => {
  try {
    const info = await transporter.sendMail(options);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,  // ← Menggunakan EMAIL_FROM
    to: email,
    subject: 'Verify Your Email - LembarKerja',
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>LembarKerja</h1>
                </div>
                <div class="content">
                    <h2>Email Verification</h2>
                    <p>Thank you for registering with LembarKerja. Please verify your email address:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" class="button">
                            Verify Email Address
                        </a>
                    </div>

                    <p>Or copy this link to your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">
                        ${verificationLink}
                    </p>

                    <p>This link expires in 24 hours.</p>
                </div>
            </body>
            </html>
        `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to:', email);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
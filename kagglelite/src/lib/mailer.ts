import nodemailer from 'nodemailer';
import db from '@/lib/db';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    console.log(`\n\n--- DEV OUTBOX EMAIL ---`);
    console.log(`To: ${to}\nSubject: ${subject}\nBody: ${html}`);
    console.log(`------------------------\n\n`);
    db.prepare('INSERT INTO dev_outbox (to_email, subject, html_body) VALUES (?, ?, ?)')
      .run(to, subject, html);
    return;
  }
  
  try {
    await transporter.sendMail({
      from: '"KaggleLite" <noreply@kagglelite.com>',
      to,
      subject,
      html
    });
  } catch(e) {
    console.error("Failed to send email", e);
  }
}

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/env.js';

interface ContactMessage {
  senderName: string;
  senderEmail: string;
  topic: string;
  message: string;
}

let transporter: Transporter | null = null;

export function isContactEmailConfigured() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.contactToEmail);
}

export async function sendContactEmail(contact: ContactMessage) {
  if (!isContactEmailConfigured()) throw new Error('Contact email is not configured.');

  transporter ??= nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });

  await transporter.sendMail({
    from: `FitMeal Website <${env.smtpUser}>`,
    to: env.contactToEmail,
    replyTo: { name: contact.senderName, address: contact.senderEmail },
    subject: `[FitMeal] ${contact.topic}`,
    text: `New message from the FitMeal website\n\nName: ${contact.senderName}\nReply email: ${contact.senderEmail}\nTopic: ${contact.topic}\n\n${contact.message}`,
  });
}

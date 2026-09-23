import nodemailer from "nodemailer";

function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error("SMTP settings are missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verificationUrl = `${appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !password || !from) {
    if (process.env.NODE_ENV !== "production") {
      return { sent: false, verificationUrl };
    }
    throw new Error("SMTP settings are missing.");
  }

  await getMailer().sendMail({
    from,
    to: email,
    subject: "Verify your Nikboni email",
    text: `Hi ${name},\n\nVerify your Nikboni account by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${name},</p><p>Verify your Nikboni account to finish creating your account.</p><p><a href="${verificationUrl}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
  });

  return { sent: true, verificationUrl };
}

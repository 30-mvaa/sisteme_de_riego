import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName: string
) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hola ${userName},</h2>
      <p>Recibiste este correo porque solicitaste recuperar tu contraseña.</p>
      <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        Chuichun - Sistema de Gestión Comunitaria
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Chuichun" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperación de Contraseña - Chuichun",
    html,
  });
}

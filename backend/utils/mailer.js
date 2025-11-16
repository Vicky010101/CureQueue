const nodemailer = require("nodemailer");

// --- Brevo SMTP Transporter (Replaces old Gmail config) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: false, // must be false for port 587
  auth: {
    user: process.env.SMTP_USER, // example: 9bad18001@smtp-brevo.com
    pass: process.env.SMTP_PASS  // your API key
  }
});

// --- EMAIL FUNCTIONS (no logic changed) ---

function sendAppointmentConfirmation({ to, patientName, doctorName, appointmentTimeIST, waitingTime }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Appointment Confirmation',
    html: `<p>Dear ${patientName},</p>
           <p>Your appointment has been successfully booked.</p>
           <p><strong>Doctor:</strong> ${doctorName}</p>
           <p><strong>Appointment Time (IST):</strong> ${appointmentTimeIST}</p>
           <p><strong>Estimated Waiting Time:</strong> ${waitingTime} minutes</p>
           <p>Thank you for using CureQueue!</p>`
  });
}

function sendAppointmentCancellationByDoctor({ to, patientName, doctorName, date, time }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Appointment Has Been Cancelled',
    html: `<p>Hello ${patientName},</p>
           <p>We regret to inform you that your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled by the doctor.</p>
           <p>If needed, please book a new appointment at your convenience.</p>
           <p>Thank you for using CureQueue.</p>
           <p>Best regards,<br/>CureQueue Team</p>`
  });
}

function sendAppointmentCancellationByPatient({ to, patientName, doctorName, date, time }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Appointment Has Been Successfully Cancelled',
    html: `<p>Hello ${patientName},</p>
           <p>This is to confirm that your appointment with Dr. ${doctorName} on ${date} at ${time} has been successfully cancelled as per your request.</p>
           <p>If you wish, you can book a new appointment anytime through CureQueue.</p>
           <p>Thank you,<br/>CureQueue Team</p>`
  });
}

function sendAppointmentWaitingTimeUpdate({ to, patientName, doctorName, status, waitingTime }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Appointment Has Been Updated',
    html: `<p>Dear ${patientName},</p>
           <p>Your appointment with Dr. ${doctorName} has been updated.</p>
           <p><strong>Status:</strong> ${status}</p>
           <p><strong>Estimated Wait Time:</strong> ${waitingTime} minutes</p>
           <p>Thank you for using CureQueue.</p>`
  });
}

function sendHomeVisitAccepted({ to, patientName, doctorName, date, address }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Home Visit Request Has Been Accepted',
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
           <h2 style="color: #0f766e;">Home Visit Request Accepted</h2>
           <p>Hello <strong>${patientName}</strong>,</p>
           <p>Great news! Dr. <strong>${doctorName}</strong> has accepted your home visit request.</p>
           <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
               <p><strong>📅 Date:</strong> ${date}</p>
               <p><strong>📍 Address:</strong> ${address}</p>
               <p><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
           </div>
           <p>Thank you for using <strong>CureQueue</strong>!</p>
           <hr/>
           <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team</p>
           </div>`
  });
}

function sendHomeVisitRejected({ to, patientName, doctorName, date, address }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Home Visit Request Has Been Declined',
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
           <h2 style="color: #ef4444;">Home Visit Request Declined</h2>
           <p>Hello <strong>${patientName}</strong>,</p>
           <p>We regret to inform you that Dr. <strong>${doctorName}</strong> is unavailable and has declined your home visit request.</p>
           <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
               <p><strong>📅 Requested Date:</strong> ${date}</p>
               <p><strong>📍 Address:</strong> ${address}</p>
           </div>
           <p>We apologize for any inconvenience. Thank you for your understanding!</p>
           <hr/>
           <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team</p>
           </div>`
  });
}

function sendHomeVisitCompleted({ to, patientName, doctorName, date, address }) {
  return transporter.sendMail({
    from: `CureQueue <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Home Visit Appointment is Completed',
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
           <h2 style="color: #0284c7;">Home Visit Appointment Completed</h2>
           <p>Hello <strong>${patientName}</strong>,</p>
           <p>Your home visit appointment with Dr. <strong>${doctorName}</strong> has been successfully marked as completed.</p>
           <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0;">
               <p><strong>📅 Date:</strong> ${date}</p>
               <p><strong>📍 Address:</strong> ${address}</p>
           </div>
           <p>Thank you for choosing <strong>CureQueue</strong> for your healthcare needs!</p>
           <hr/>
           <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team</p>
           </div>`
  });
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellationByDoctor,
  sendAppointmentCancellationByPatient,
  sendAppointmentWaitingTimeUpdate,
  sendHomeVisitAccepted,
  sendHomeVisitRejected,
  sendHomeVisitCompleted
};

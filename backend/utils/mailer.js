const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.MAIL_SENDER;

async function sendMail(to, subject, html) {
  try {
    return await resend.emails.send({
      from: `CureQueue <${SENDER}>`,
      to: [to],
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}

function sendAppointmentConfirmation({ to, patientName, doctorName, appointmentTimeIST, waitingTime }) {
  return sendMail(
    to,
    "Appointment Confirmation",
    `<p>Dear ${patientName},</p>
     <p>Your appointment has been successfully booked.</p>
     <p><strong>Doctor:</strong> ${doctorName}</p>
     <p><strong>Appointment Time (IST):</strong> ${appointmentTimeIST}</p>
     <p><strong>Estimated Waiting Time:</strong> ${waitingTime} minutes</p>
     <p>Thank you for using CureQueue!</p>`
  );
}

function sendAppointmentCancellationByDoctor({ to, patientName, doctorName, date, time }) {
  return sendMail(
    to,
    "Your Appointment Has Been Cancelled",
    `<p>Hello ${patientName},</p>
     <p>Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled by the doctor.</p>
     <p>Please book again if needed.</p>
     <p>Regards,<br/>CureQueue Team</p>`
  );
}

function sendAppointmentCancellationByPatient({ to, patientName, doctorName, date, time }) {
  return sendMail(
    to,
    "Your Appointment Has Been Successfully Cancelled",
    `<p>Hello ${patientName},</p>
     <p>Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled as per your request.</p>
     <p>Thank you,<br/>CureQueue Team</p>`
  );
}

function sendAppointmentWaitingTimeUpdate({ to, patientName, doctorName, status, waitingTime }) {
  return sendMail(
    to,
    "Your Appointment Has Been Updated",
    `<p>Dear ${patientName},</p>
     <p>Your appointment with Dr. ${doctorName} has been updated.</p>
     <p><strong>Status:</strong> ${status}</p>
     <p><strong>Estimated Wait Time:</strong> ${waitingTime} minutes</p>
     <p>Thank you for using CureQueue.</p>`
  );
}

function sendHomeVisitAccepted({ to, patientName, doctorName, date, address }) {
  return sendMail(
    to,
    "Home Visit Request Accepted",
    `<h2>Home Visit Request Accepted</h2>
     <p>Hello ${patientName},</p>
     <p>Great news! Dr. ${doctorName} has accepted your home visit request.</p>
     <p>Date: ${date}<br>Address: ${address}</p>`
  );
}

function sendHomeVisitRejected({ to, patientName, doctorName, date, address }) {
  return sendMail(
    to,
    "Home Visit Request Declined",
    `<h2>Home Visit Request Declined</h2>
     <p>Hello ${patientName},</p>
     <p>Dr. ${doctorName} declined your request for ${date} at ${address}.</p>`
  );
}

function sendHomeVisitCompleted({ to, patientName, doctorName, date, address }) {
  return sendMail(
    to,
    "Home Visit Appointment Completed",
    `<h2>Home Visit Appointment Completed</h2>
     <p>Hello ${patientName},</p>
     <p>Your home visit appointment with Dr. ${doctorName} has been marked completed.</p>
     <p>Date: ${date}<br>Address: ${address}</p>`
  );
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

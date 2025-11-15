
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendAppointmentConfirmation({ to, patientName, doctorName, appointmentTimeIST, waitingTime }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Appointment Confirmation',
        html: `<p>Dear ${patientName},</p>
               <p>Your appointment has been successfully booked.</p>
               <p><strong>Doctor:</strong> ${doctorName}</p>
               <p><strong>Appointment Time (IST):</strong> ${appointmentTimeIST}</p>
               <p><strong>Estimated Waiting Time:</strong> ${waitingTime} minutes</p>
               <p>Thank you for using CureQueue!</p>`
    };
    return transporter.sendMail(mailOptions);
}

function sendAppointmentCancellationByDoctor({ to, patientName, doctorName, date, time }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Appointment Has Been Cancelled',
        html: `<p>Hello ${patientName},</p>
               <p>We regret to inform you that your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled by the doctor.</p>
               <p>If needed, please book a new appointment at your convenience.</p>
               <p>Thank you for using CureQueue.</p>
               <p>Best regards,<br/>CureQueue Team</p>`
    };
    return transporter.sendMail(mailOptions);
}

function sendAppointmentCancellationByPatient({ to, patientName, doctorName, date, time }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Appointment Has Been Successfully Cancelled',
        html: `<p>Hello ${patientName},</p>
               <p>This is to confirm that your appointment with Dr. ${doctorName} on ${date} at ${time} has been successfully cancelled as per your request.</p>
               <p>If you wish, you can book a new appointment anytime through CureQueue.</p>
               <p>Thank you,<br/>CureQueue Team</p>`
    };
    return transporter.sendMail(mailOptions);
}

function sendAppointmentWaitingTimeUpdate({ to, patientName, doctorName, status, waitingTime }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Appointment Has Been Updated',
        html: `<p>Dear ${patientName},</p>
               <p>Your appointment with Dr. ${doctorName} has been updated.</p>
               <p><strong>Status:</strong> ${status}</p>
               <p><strong>Estimated Wait Time:</strong> ${waitingTime} minutes</p>
               <p>Thank you for using CureQueue.</p>`
    };
    return transporter.sendMail(mailOptions);
}

function sendHomeVisitAccepted({ to, patientName, doctorName, date, address }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Home Visit Request Has Been Accepted',
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <h2 style="color: #0f766e;">Home Visit Request Accepted</h2>
               <p>Hello <strong>${patientName}</strong>,</p>
               <p>Great news! Dr. <strong>${doctorName}</strong> has accepted your home visit request.</p>
               <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
                   <p style="margin: 5px 0;"><strong>📍 Address:</strong> ${address}</p>
                   <p style="margin: 5px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
               </div>
               <p><strong>Please ensure:</strong></p>
               <ul>
                   <li>You are available at your provided address on the scheduled date</li>
                   <li>Your location is accessible for the doctor</li>
                   <li>Any necessary medical records or information are ready</li>
               </ul>
               <p>Thank you for using <strong>CureQueue</strong>!</p>
               <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
               <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team<br/>Your Health, Our Priority</p>
               </div>`
    };
    return transporter.sendMail(mailOptions);
}

function sendHomeVisitRejected({ to, patientName, doctorName, date, address }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Home Visit Request Has Been Declined',
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <h2 style="color: #ef4444;">Home Visit Request Declined</h2>
               <p>Hello <strong>${patientName}</strong>,</p>
               <p>We regret to inform you that Dr. <strong>${doctorName}</strong> is unavailable and has declined your home visit request.</p>
               <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>📅 Requested Date:</strong> ${date}</p>
                   <p style="margin: 5px 0;"><strong>📍 Address:</strong> ${address}</p>
                   <p style="margin: 5px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
                   <p style="margin: 5px 0;"><strong>❌ Status:</strong> Declined</p>
               </div>
               <p><strong>Alternative Options:</strong></p>
               <ul>
                   <li>Try booking another home visit slot with a different doctor</li>
                   <li>Schedule a clinic visit at your convenience</li>
                   <li>Contact our support team for assistance</li>
               </ul>
               <p>We apologize for any inconvenience. Thank you for your understanding!</p>
               <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
               <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team<br/>Your Health, Our Priority</p>
               </div>`
    };
    return transporter.sendMail(mailOptions);
}

function sendHomeVisitCompleted({ to, patientName, doctorName, date, address }) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your Home Visit Appointment is Completed',
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <h2 style="color: #0284c7;">Home Visit Appointment Completed</h2>
               <p>Hello <strong>${patientName}</strong>,</p>
               <p>Your home visit appointment with Dr. <strong>${doctorName}</strong> has been successfully marked as completed.</p>
               <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0;">
                   <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
                   <p style="margin: 5px 0;"><strong>📍 Address:</strong> ${address}</p>
                   <p style="margin: 5px 0;"><strong>👨‍⚕️ Doctor:</strong> Dr. ${doctorName}</p>
                   <p style="margin: 5px 0;"><strong>✅ Status:</strong> Completed</p>
               </div>
               <p>We hope you had a good experience with your home visit appointment!</p>
               <p><strong>What's next?</strong></p>
               <ul>
                   <li>Follow the treatment plan prescribed by your doctor</li>
                   <li>Take any prescribed medications as directed</li>
                   <li>Schedule a follow-up if recommended</li>
                   <li>Contact us if you have any concerns</li>
               </ul>
               <p>Thank you for choosing <strong>CureQueue</strong> for your healthcare needs!</p>
               <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
               <p style="font-size: 12px; color: #6b7280;">Best regards,<br/>CureQueue Team<br/>Your Health, Our Priority</p>
               </div>`
    };
    return transporter.sendMail(mailOptions);
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

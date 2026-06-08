// ── Google Meet Link Generator ─────────────────────────────────
export function generateMeetLink() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}

// ── EmailJS Credentials ────────────────────────────────────────
const SERVICE_ID  = "service_spjcoql";
const TEMPLATE_ID = "template_wi9tyqg";
const PUBLIC_KEY  = "fXAJyVdcDMwGJwoGQ";
const ADMIN_EMAIL = "triangle.esldivision1@gmail.com";

// Template variables (must match EmailJS template exactly):
//   {{name}}        — sender name shown in header
//   {{email}}       — used in Reply To field
//   {{message}}     — main body content block
//   {{meet_link}}   — Google Meet URL
//   {{title}}       — email subject suffix

async function sendEmailJS(params) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:      SERVICE_ID,
      template_id:     TEMPLATE_ID,
      user_id:         PUBLIC_KEY,
      template_params: params,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[EmailJS] Send failed:", text);
    throw new Error(`EmailJS error: ${text}`);
  }
}

// ── Booking confirmation ───────────────────────────────────────
export async function sendBookingEmails({
  studentName, studentEmail, teacher, slot, pkg, amount, meetLink,
}) {
  // To student
  await sendEmailJS({
    title:     "Your Triangle ESL Class is Confirmed – Meeting Link Inside",
    name:      studentName,
    email:     studentEmail,
    meet_link: meetLink,
    message:
      `Your class has been confirmed! Here are your details:\n\n` +
      `Teacher: ${teacher}\n` +
      `Schedule: ${slot}\n` +
      `Package: ${pkg}\n` +
      `Amount: ${amount}\n\n` +
      `Join your class here:\n${meetLink}\n\n` +
      `If you have any questions, reply to this email.\n\n-Triangle ESL Team`,
  });

  // To admin
  await sendEmailJS({
    title:     "New Booking Received",
    name:      "Triangle ESL Admin",
    email:     ADMIN_EMAIL,
    meet_link: meetLink,
    message:
      `New booking received!\n\n` +
      `Student: ${studentName} <${studentEmail}>\n` +
      `Teacher: ${teacher}\n` +
      `Schedule: ${slot}\n` +
      `Package: ${pkg}\n` +
      `Amount: ${amount}\n\n` +
      `Google Meet: ${meetLink}`,
  });
}

// ── Demo confirmation (10-min session) ────────────────────────
export async function sendDemoEmails({
  studentName, studentEmail, slot, level, meetLink,
}) {
  // To student
  await sendEmailJS({
    title:     "Your Free 10-Minute Demo is Booked!",
    name:      studentName,
    email:     studentEmail,
    meet_link: meetLink,
    message:
      `Your FREE 10-minute demo class has been booked!\n\n` +
      `Schedule: ${slot}\n` +
      `English Level: ${level}\n` +
      `Session Duration: 10 minutes\n\n` +
      `Join your demo here:\n${meetLink}\n\n` +
      `The session will be 10 minutes for demo classes.\n\n` +
      `If you have any questions, reply to this email.\n\n-Triangle ESL Team`,
  });

  // To admin
  await sendEmailJS({
    title:     "New Demo Request Received",
    name:      "Triangle ESL Admin",
    email:     ADMIN_EMAIL,
    meet_link: meetLink,
    message:
      `New DEMO REQUEST received!\n\n` +
      `Student: ${studentName} <${studentEmail}>\n` +
      `Schedule: ${slot}\n` +
      `Level: ${level}\n\n` +
      `Google Meet: ${meetLink}`,
  });
}
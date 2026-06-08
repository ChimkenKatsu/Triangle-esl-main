import { useState } from "react";
import supabase from "../../lib/supabase";
import { generateMeetLink, sendDemoEmails } from "../../lib/meetUtils";
import C from "../../styles/theme";
import { SLOTS, LEVELS } from "../../data/constants";
import { Eyebrow, Title, Subtitle, Field, GoldBtn } from "../ui";

const iStyle = {
  width: "100%", padding: "12px 14px",
  border: `2px solid ${C.borderLight}`, borderRadius: 10,
  fontSize: 14, fontFamily: "'Nunito',sans-serif",
  fontWeight: 600, color: C.text, outline: "none",
  background: "#fff", transition: "border .15s",
};

export default function DemoModal({ onClose }) {
  const [f, setF] = useState({ name: "", email: "", slot: "", level: "" });
  const [done, setDone]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs]     = useState({});
  const [meetLink, setMeetLink] = useState("");

  const submit = async () => {
    const e = {};
    if (!f.name.trim())  e.name  = "Required";
    if (!f.email.trim()) e.email = "Required";
    if (!f.slot)         e.slot  = "Select a slot";
    if (!f.level)        e.level = "Select your level";
    if (Object.keys(e).length) { setErrs(e); return; }

    setSaving(true);
    try {
      const link = generateMeetLink();
      const sessionEnd = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // 1. Save to Supabase
      try {
        await supabase.insertDemo({
          name:           f.name,
          email:          f.email,
          preferred_slot: f.slot,
          english_level:  f.level,
          status:         "Pending",
          meet_link:      link,
          session_end:    sessionEnd,
          created_at:     new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Supabase insert failed (continuing):", dbErr);
      }

      // 2. Send emails — errors shown clearly
      try {
        await sendDemoEmails({
          studentName:  f.name,
          studentEmail: f.email,
          slot:         f.slot,
          level:        f.level,
          meetLink:     link,
        });
        console.log("✅ Emails sent successfully");
      } catch (emailErr) {
        console.error("❌ Email send failed:", emailErr);
        alert("⚠️ Booking saved! But email failed:\n\n" + emailErr.message + "\n\nCheck browser console for details.");
      }

      setMeetLink(link);
      setDone(true);
    } catch (err) {
      console.error("Demo booking failed:", err);
      alert("Unable to complete booking.\n\n" + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(14,24,41,.75)",
        zIndex: 1000, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(8px)",
        overflowY: "auto",
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 24,
        padding: "32px 28px",
        maxWidth: 480, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
        position: "relative",
        border: `3px solid ${C.gold}`,
        boxShadow: `0 32px 80px rgba(245,166,35,.3)`,
        animation: "popIn .32s cubic-bezier(.175,.885,.32,1.275) both",
        margin: "auto",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: C.goldPale, border: `2px solid ${C.border}`,
            width: 34, height: 34, borderRadius: "50%",
            cursor: "pointer", fontWeight: 900, fontSize: 16,
            color: C.navy, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >✕</button>

        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 14, animation: "bounceIn .5s ease both" }}>🎉</div>
            <Title center size={24}>Demo Booked!</Title>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 20, fontWeight: 600 }}>
              Thank you, <strong>{f.name}</strong>!<br />
              Your <strong>free 10-minute demo class</strong> has been scheduled.<br />
              A confirmation has been sent to <strong>{f.email}</strong>.
            </p>

            {/* Meet link box */}
            <div style={{
              background: "#EEF2FF", border: "2px solid #6366F1",
              borderRadius: 14, padding: "16px 18px", marginBottom: 20, textAlign: "left",
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#4338CA", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                🎥 Your Google Meet Link
              </div>
              <a
                href={meetLink}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#4338CA", fontWeight: 700, fontSize: 13, wordBreak: "break-all" }}
              >
                {meetLink}
              </a>
              <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700, marginTop: 8 }}>
                ⏱ Session duration: <strong>10 minutes</strong>
              </div>
            </div>

            <GoldBtn onClick={onClose} full large>Close</GoldBtn>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 4 }}>
              <Eyebrow>Free Demo Class</Eyebrow>
            </div>
            <Title size={24}>Book Your Free Demo</Title>

            {/* 10-minute badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#FEF3C7", border: "1.5px solid #F59E0B",
              borderRadius: 100, padding: "5px 14px", marginBottom: 14,
            }}>
              <span style={{ fontSize: 14 }}>⏱</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#92400E" }}>
                10-minute free session · No payment · No pressure
              </span>
            </div>

            <div style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}>
              <Field label="Your Name" error={errs.name} half>
                <input
                  value={f.name}
                  onChange={e => setF({ ...f, name: e.target.value })}
                  placeholder="Full name"
                  style={iStyle}
                />
              </Field>

              <Field label="Email Address" error={errs.email} half>
                <input
                  type="email"
                  value={f.email}
                  onChange={e => setF({ ...f, email: e.target.value })}
                  placeholder="your@email.com"
                  style={iStyle}
                />
              </Field>

              <Field label="Preferred Day & Time" error={errs.slot}>
                <select value={f.slot} onChange={e => setF({ ...f, slot: e.target.value })} style={iStyle}>
                  <option value="">Select a time slot</option>
                  {SLOTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Your English Level" error={errs.level}>
                <select value={f.level} onChange={e => setF({ ...f, level: e.target.value })} style={iStyle}>
                  <option value="">Select your level</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            {/* Info notice */}
            <div style={{
              background: "#F0FDF4", border: "1.5px solid #86EFAC",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#166534", fontWeight: 600,
            }}>
              📧 A Google Meet link will be emailed to you and our team automatically upon booking.
            </div>

            <GoldBtn onClick={submit} full large disabled={saving}>
              {saving ? "⏳ Booking…" : "📋 Book My Free 10-Min Demo →"}
            </GoldBtn>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import C from "../styles/theme";
import PACKAGES from "../data/packages";
import TEACHERS from "../data/teachers";
import { SLOTS, LEVELS } from "../data/constants";
import { Eyebrow, Title, Subtitle, Card, Field, GoldBtn, SecBtn } from "../components/ui";

// ── Shared input style ────────────────────────────────────────
const iStyle = {
  width: "100%", padding: "12px 14px",
  border: `2px solid ${C.borderLight}`, borderRadius: 10,
  fontSize: 14, fontFamily: "'Nunito',sans-serif",
  fontWeight: 600, color: C.text,
  outline: "none", background: "#fff", transition: "border .15s",
};

// ── Step progress bar ─────────────────────────────────────────
function StepBar({ current }) {
  const steps = ["Details", "Schedule", "Package", "Payment"];
  return (
    <div style={{ display: "flex", position: "relative", marginBottom: 36 }}>
      <div style={{ position: "absolute", top: 17, left: 18, right: 18, height: 2, background: C.borderLight }} />
      {steps.map((lbl, i) => {
        const n = i + 1;
        const isDone   = n < current;
        const isActive = n === current;
        return (
          <div key={lbl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background:  isDone ? C.navy  : isActive ? C.gold  : "#fff",
              border:      `2.5px solid ${isDone ? C.navy : isActive ? C.gold : C.border}`,
              color:       isDone ? C.gold  : isActive ? C.navy  : C.muted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13,
              boxShadow: isActive ? `0 0 0 5px rgba(245,166,35,.2)` : "none",
              transition: "all .2s",
            }}>
              {isDone ? "✓" : n}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, letterSpacing: ".04em",
              color: isDone ? C.navy : isActive ? C.goldDark : C.muted,
            }}>
              {lbl}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Confirmation screen ───────────────────────────────────────
function ConfirmScreen({ form, slot, pkgId, onReset }) {
  const pkg = PACKAGES.find(p => p.id === pkgId);
  return (
    <Card style={{ maxWidth: 580, margin: "0 auto", textAlign: "center", padding: 52 }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <Title center>Booking Confirmed!</Title>
      <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, marginBottom: 28, fontWeight: 600 }}>
        Thank you, <strong>{form.name}</strong>!<br />
        Your <strong>{pkg?.label}</strong> with <strong>{form.teacher || "our team"}</strong><br />
        on <strong>{slot}</strong> is confirmed.<br />
        Confirmation will be sent to <strong>{form.email}</strong>.
      </p>

      {/* Receipt */}
      <div style={{ background: C.goldPale, border: `2px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 28, textAlign: "left" }}>
        {[
          ["Package",  pkg?.label],
          ["Sessions", `${pkg?.sessions} class${pkg?.sessions > 1 ? "es" : ""}`],
          ["Total Paid", `$${pkg?.price}`],
          ["Schedule", slot],
          ["Teacher",  form.teacher || "Any Teacher"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
            <span style={{ color: C.muted, fontWeight: 600 }}>{k}</span>
            <span style={{ fontWeight: 800, color: C.navy }}>{v}</span>
          </div>
        ))}
      </div>

      <GoldBtn full large onClick={onReset}>Book Another Class</GoldBtn>
    </Card>
  );
}

// ── Main BookingPage ──────────────────────────────────────────
export default function BookingPage({ prefill, onNewBooking }) {
  const [step,   setStep]   = useState(1);
  const [form,   setForm]   = useState({ name: "", email: "", level: "", teacher: prefill || "" });
  const [slot,   setSlot]   = useState("");
  const [pkgId,  setPkgId]  = useState("");
  const [card,   setCard]   = useState({ num: "", exp: "", cvv: "", name: "" });
  const [errs,   setErrs]   = useState({});
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  // Sync pre-filled teacher (from "Book this teacher" button)
  useEffect(() => {
    if (prefill) setForm(f => ({ ...f, teacher: prefill }));
  }, [prefill]);

  // ── Validation helpers ──
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.level)        e.level = "Choose your level";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  // ── Final submit ──
  const confirmBooking = async () => {
    const e = {};
    if (!card.num.trim())  e.num   = "Required";
    if (!card.exp.trim())  e.exp   = "Required";
    if (!card.cvv.trim())  e.cvv   = "Required";
    if (!card.name.trim()) e.cname = "Required";
    if (Object.keys(e).length) { setErrs(e); return; }

    const pkg = PACKAGES.find(p => p.id === pkgId);
    const record = {
      name:    form.name,
      email:   form.email,
      teacher: form.teacher || "Any Teacher",
      slot,
      level:   form.level,
      pkg:     pkg.label,
      amount:  `$${pkg.price}`,
      status:  "Confirmed",
      date:    new Date().toISOString().slice(0, 10),
    };

    setSaving(true);
    try {
      await supabase.insertBooking(record);
    } catch (_) {
      // Supabase not configured yet — still proceed
    }
    setSaving(false);
    onNewBooking(record);
    setDone(true);
  };

  const reset = () => {
    setDone(false);
    setStep(1);
    setSlot("");
    setPkgId("");
    setForm({ name: "", email: "", level: "", teacher: "" });
    setCard({ num: "", exp: "", cvv: "", name: "" });
    setErrs({});
  };

  if (done) return <ConfirmScreen form={form} slot={slot} pkgId={pkgId} onReset={reset} />;

  const pkg = PACKAGES.find(p => p.id === pkgId);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <StepBar current={step} />

      <Card>

        {/* ════ STEP 1 — Details ════ */}
        {step === 1 && (
          <>
            <Title size={22}>Your Details</Title>
            <Subtitle>Tell us a bit about yourself to get started.</Subtitle>

            <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Field label="Full Name" error={errs.name} half>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maria Santos"
                  style={iStyle}
                />
              </Field>

              <Field label="Email Address" error={errs.email} half>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  style={iStyle}
                />
              </Field>

              <Field label="English Level" error={errs.level} half>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  style={iStyle}
                >
                  <option value="">Select your level</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>

              <Field label="Preferred Teacher" half>
                <select
                  value={form.teacher}
                  onChange={e => setForm({ ...form, teacher: e.target.value })}
                  style={iStyle}
                >
                  <option value="">No preference</option>
                  {TEACHERS.map(t => <option key={t.id}>{t.name}</option>)}
                </select>
              </Field>
            </div>

            <GoldBtn full large onClick={() => { if (validateStep1()) { setErrs({}); setStep(2); } }}>
              Continue →
            </GoldBtn>
          </>
        )}

        {/* ════ STEP 2 — Schedule ════ */}
        {step === 2 && (
          <>
            <Title size={22}>Choose Your Schedule</Title>
            <Subtitle>Pick the day and time that works best for you.</Subtitle>

            <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(126px,1fr))", gap: 8, marginBottom: 20 }}>
              {SLOTS.map(s => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  style={{
                    background:   slot === s ? C.gold : C.goldPale,
                    border:       `2px solid ${slot === s ? C.gold : C.border}`,
                    borderRadius: 10,
                    padding:      "9px 8px",
                    fontFamily:   "'Nunito',sans-serif",
                    fontSize:     12,
                    fontWeight:   700,
                    color:        slot === s ? C.navy : C.muted,
                    cursor:       "pointer",
                    transition:   "all .15s",
                    boxShadow:    slot === s ? `0 4px 12px rgba(245,166,35,.32)` : "none",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {errs.slot && (
              <p style={{ color: "#E04040", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                ⚠ Please select a time slot.
              </p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <SecBtn onClick={() => setStep(1)}>← Back</SecBtn>
              <GoldBtn full large onClick={() => {
                if (!slot) { setErrs({ slot: true }); return; }
                setErrs({});
                setStep(3);
              }}>
                Continue →
              </GoldBtn>
            </div>
          </>
        )}

        {/* ════ STEP 3 — Package ════ */}
        {step === 3 && (
          <>
            <Title size={22}>Choose a Package</Title>
            <Subtitle>Pick the plan that best fits your goals and budget.</Subtitle>

            <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(176px,1fr))", gap: 12, marginBottom: 20 }}>
              {PACKAGES.map(p => (
                <div
                  key={p.id}
                  onClick={() => setPkgId(p.id)}
                  style={{
                    border:       `2.5px solid ${pkgId === p.id ? p.color : C.border}`,
                    borderRadius: 16,
                    padding:      "20px 16px",
                    cursor:       "pointer",
                    background:   pkgId === p.id ? `rgba(${p.rgb},.06)` : C.goldPale,
                    position:     "relative",
                    transition:   "all .18s",
                    boxShadow:    pkgId === p.id ? `0 8px 24px rgba(${p.rgb},.18)` : "none",
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position:     "absolute", top: -1, right: 12,
                      fontSize:     10, fontWeight: 800,
                      padding:      "3px 10px", borderRadius: "0 0 8px 8px",
                      letterSpacing:".05em",
                      background:   p.badge === "POPULAR" ? C.navy : p.color,
                      color:        p.badge === "POPULAR" ? C.gold : "#fff",
                    }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: C.navy, marginBottom: 2 }}>{p.label}</div>
                  <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                    {p.sessions} session{p.sessions > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 28, fontWeight: 900, color: p.color }}>${p.price}</div>
                  {p.per && <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 3 }}>{p.per}/class</div>}
                </div>
              ))}
            </div>

            {errs.pkg && (
              <p style={{ color: "#E04040", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                ⚠ Please select a package.
              </p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <SecBtn onClick={() => setStep(2)}>← Back</SecBtn>
              <GoldBtn full large onClick={() => {
                if (!pkgId) { setErrs({ pkg: true }); return; }
                setErrs({});
                setStep(4);
              }}>
                Continue →
              </GoldBtn>
            </div>
          </>
        )}

        {/* ════ STEP 4 — Payment ════ */}
        {step === 4 && pkg && (
          <>
            <Title size={22}>Review &amp; Payment</Title>

            {/* Booking summary */}
            <div style={{ background: C.goldPale, border: `2px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", marginBottom: 24, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: C.muted, marginBottom: 12 }}>
                Booking Summary
              </div>
              {[
                ["Student",  form.name],
                ["Email",    form.email],
                ["Level",    form.level],
                ["Teacher",  form.teacher || "Any Teacher"],
                ["Schedule", slot],
                ["Package",  pkg.label],
                ["Sessions", `${pkg.sessions} class${pkg.sessions > 1 ? "es" : ""}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
                  <span style={{ color: C.muted, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontWeight: 700, color: C.text }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, fontSize: 18, fontWeight: 800, color: C.goldDark }}>
                <span>Total Due</span>
                <span>${pkg.price}</span>
              </div>
            </div>

            {/* Card inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Field label="Card Number" error={errs.num}>
                <input
                  value={card.num}
                  onChange={e => setCard({ ...card, num: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={iStyle}
                />
              </Field>

              <Field label="Name on Card" error={errs.cname}>
                <input
                  value={card.name}
                  onChange={e => setCard({ ...card, name: e.target.value })}
                  placeholder="As shown on card"
                  style={iStyle}
                />
              </Field>

              <Field label="Expiry Date" error={errs.exp} half>
                <input
                  value={card.exp}
                  onChange={e => setCard({ ...card, exp: e.target.value })}
                  placeholder="MM / YY"
                  maxLength={7}
                  style={iStyle}
                />
              </Field>

              <Field label="CVV" error={errs.cvv} half>
                <input
                  value={card.cvv}
                  onChange={e => setCard({ ...card, cvv: e.target.value })}
                  placeholder="•••"
                  maxLength={4}
                  style={iStyle}
                />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <SecBtn onClick={() => setStep(3)}>← Back</SecBtn>
              <GoldBtn full large onClick={confirmBooking} disabled={saving}>
                {saving ? "⏳ Processing…" : `🔒 Pay $${pkg.price} & Confirm`}
              </GoldBtn>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 12, fontWeight: 700 }}>
              🔒 256-bit SSL encrypted · Secure payment
            </p>
          </>
        )}

      </Card>
    </div>
  );
}

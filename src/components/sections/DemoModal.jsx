import { useState } from "react";
import supabase from "../../lib/supabase";
import C from "../../styles/theme";
import { SLOTS, LEVELS } from "../../data/constants";
import { Eyebrow, Title, Subtitle, Field, GoldBtn } from "../ui";

const iStyle = {
  width:"100%", padding:"12px 14px",
  border:`2px solid ${C.borderLight}`, borderRadius:10,
  fontSize:14, fontFamily:"'Nunito',sans-serif",
  fontWeight:600, color:C.text, outline:"none",
  background:"#fff", transition:"border .15s",
};

export default function DemoModal({ onClose }) {
  const [f, setF] = useState({
    name:"",
    email:"",
    slot:"",
    level:""
  });

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState({});

  const submit = async () => {
    const e = {};

    if (!f.name.trim()) e.name = "Required";
    if (!f.email.trim()) e.email = "Required";
    if (!f.slot) e.slot = "Select a slot";
    if (!f.level) e.level = "Select your level";

    if (Object.keys(e).length) {
      setErrs(e);
      return;
    }

    setSaving(true);

    try {
      const result = await supabase.insertDemo({
        name: f.name,
        email: f.email,
        preferred_slot: f.slot,
        english_level: f.level,
        created_at: new Date().toISOString(),
      });

      console.log("Demo saved successfully:", result);

      // Only show success if Supabase actually saved it
      setDone(true);

    } catch (err) {
      console.error("Demo insert failed:", err);

      alert(
        "Unable to save demo request.\n\n" +
        (err?.message || "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed",
        inset:0,
        background:"rgba(14,24,41,.75)",
        zIndex:1000,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        padding:20,
        backdropFilter:"blur(8px)",
      }}
    >
      <div
        style={{
          background:"#fff",
          borderRadius:24,
          padding:40,
          maxWidth:480,
          width:"100%",
          maxHeight:"90vh",
          overflowY:"auto",
          position:"relative",
          border:`3px solid ${C.gold}`,
          boxShadow:`0 32px 80px rgba(245,166,35,.3)`,
          animation:"popIn .32s cubic-bezier(.175,.885,.32,1.275) both",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position:"absolute",
            top:16,
            right:16,
            background:C.goldPale,
            border:`2px solid ${C.border}`,
            width:34,
            height:34,
            borderRadius:"50%",
            cursor:"pointer",
            fontWeight:900,
            fontSize:16,
            color:C.navy,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
          }}
        >
          ✕
        </button>

        {done ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div
              style={{
                fontSize:64,
                marginBottom:18,
                animation:"bounceIn .5s ease both"
              }}
            >
              🎉
            </div>

            <Title center size={26}>Demo Booked!</Title>

            <p
              style={{
                color:C.muted,
                fontSize:14,
                lineHeight:1.8,
                marginBottom:28,
                fontWeight:600
              }}
            >
              Thank you, <strong>{f.name}</strong>!
              <br />
              We will reach out to <strong>{f.email}</strong> to confirm your
              free 30-minute demo class.
              <br />
              <br />
              See you soon! 😊
            </p>

            <GoldBtn onClick={onClose} full large>
              Close
            </GoldBtn>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:4 }}>
              <Eyebrow>Free Demo Class</Eyebrow>
            </div>

            <Title size={26}>Book Your Free Demo</Title>

            <Subtitle>
              30 minutes with a real teacher. No payment. No pressure.
            </Subtitle>

            <div
              style={{
                marginTop:22,
                display:"grid",
                gridTemplateColumns:"1fr 1fr",
                gap:"0 14px",
              }}
            >
              <Field label="Your Name" error={errs.name} half>
                <input
                  value={f.name}
                  onChange={e => setF({ ...f, name:e.target.value })}
                  placeholder="Full name"
                  style={iStyle}
                />
              </Field>

              <Field label="Email Address" error={errs.email} half>
                <input
                  type="email"
                  value={f.email}
                  onChange={e => setF({ ...f, email:e.target.value })}
                  placeholder="your@email.com"
                  style={iStyle}
                />
              </Field>

              <Field label="Preferred Day & Time" error={errs.slot}>
                <select
                  value={f.slot}
                  onChange={e => setF({ ...f, slot:e.target.value })}
                  style={iStyle}
                >
                  <option value="">Select a time slot</option>
                  {SLOTS.map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Your English Level" error={errs.level}>
                <select
                  value={f.level}
                  onChange={e => setF({ ...f, level:e.target.value })}
                  style={iStyle}
                >
                  <option value="">Select your level</option>
                  {LEVELS.map(l => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
            </div>

            <GoldBtn
              onClick={submit}
              full
              large
              disabled={saving}
            >
              {saving
                ? "⏳ Saving..."
                : "📋 Book My Free Demo →"}
            </GoldBtn>
          </>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabase";
import C from "../styles/theme";
import IMG from "../data/images";
import { Eyebrow, Title, Subtitle, Card, Field, GoldBtn, SecBtn } from "../components/ui";

// ── Shared input style ────────────────────────────────────────
const iStyle = {
  width: "100%", padding: "12px 14px",
  border: `2px solid ${C.borderLight}`, borderRadius: 10,
  fontSize: 14, fontFamily: "'Nunito',sans-serif",
  fontWeight: 600, color: C.text,
  outline: "none", background: "#fff", transition: "border .15s",
};

// ── Tab button ────────────────────────────────────────────────
function TabBtn({ active, onClick, children, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        background:    active ? C.navy : "#fff",
        color:         active ? C.gold : C.muted,
        border:        `2px solid ${active ? C.navy : C.border}`,
        padding:       "10px 22px",
        borderRadius:  10,
        fontFamily:    "'Nunito',sans-serif",
        fontWeight:    800,
        fontSize:      14,
        cursor:        "pointer",
        display:       "flex",
        alignItems:    "center",
        gap:           8,
        transition:    "all .15s",
      }}
    >
      {children}
      {badge != null && (
        <span style={{
          background:  active ? C.gold : C.goldLight,
          color:       active ? C.navy : C.goldDark,
          fontSize:    11,
          fontWeight:  900,
          padding:     "1px 7px",
          borderRadius: 100,
          minWidth:    20,
          textAlign:   "center",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <Card pad={18}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontSize: 26, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{label}</div>
    </Card>
  );
}

// ── DB status pill ────────────────────────────────────────────
function DbPill({ status }) {
  const map = {
    idle:    { bg: C.goldLight,   text: C.goldDark,  dot: C.gold,      label: "Connecting…"                          },
    ok:      { bg: "#D1FAE5",     text: "#065F46",   dot: "#10B981",    label: "Supabase Connected"                  },
    error:   { bg: "#FEE2E2",     text: "#991B1B",   dot: "#EF4444",    label: "Using Local Data (Configure Supabase)" },
  };
  const s = map[status] || map.idle;
  return (
    <div style={{
      background:  s.bg,
      color:       s.text,
      fontSize:    11, fontWeight: 800,
      padding:     "5px 12px", borderRadius: 100,
      border:      `1px solid ${s.dot}33`,
      display:     "flex", alignItems: "center", gap: 6,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background:  s.dot,
        display:     "inline-block",
        animation:   status === "idle" ? "pulse 1.5s infinite" : "none",
      }} />
      {s.label}
    </div>
  );
}

// ── Setup notice ─────────────────────────────────────────────
function SetupNotice() {
  return (
    <div style={{
      background: "#FFF7ED", border: "2px solid #FDE68A",
      borderRadius: 14, padding: "16px 20px", marginBottom: 22,
      fontSize: 13, fontWeight: 600, color: "#92400E", lineHeight: 1.7,
    }}>
      <strong>⚡ Connect Supabase:</strong> Open{" "}
      <code style={{ background: "#FEF3C7", padding: "1px 6px", borderRadius: 4 }}>src/lib/supabase.js</code>
      {" "}and replace <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> with your project credentials.<br />
      Then create two tables in your Supabase SQL editor:
      <code style={{ display: "block", marginTop: 8, background: "#FEF3C7", padding: "8px 12px", borderRadius: 6, fontSize: 12 }}>
        bookings(id, name, email, teacher, slot, level, pkg, amount, status, date, created_at){"\n"}
        demo_requests(id, name, email, preferred_slot, english_level, created_at)
      </code>
      Currently showing local demo data.
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────
export default function AdminPage({ localBookings }) {
  const [authed,    setAuthed]    = useState(false);
  const [pass,      setPass]      = useState("");
  const [passErr,   setPassErr]   = useState(false);
  const [rows,      setRows]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [dbStatus,  setDbStatus]  = useState("idle");
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [demoSearch, setDemoSearch] = useState("");

  // ── Load data from Supabase (or fallback to local) ──
  const [bookings, setBookings] = useState([]);
const [demos, setDemos] = useState([]);

const loadData = useCallback(async () => {
  setLoading(true);

  try {
    const [bookingData, demoData] = await Promise.all([
      supabase.getBookings(),
      supabase.getDemoRequests(),
    ]);

    setBookings(bookingData || []);
    setDemos(demoData || []);

    setRows(bookingData || []);
    setDbStatus("ok");
  } catch (err) {
    console.error(err);

    setRows(localBookings);
    setDbStatus("error");
  }

  setLoading(false);
}, [localBookings]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const login = () => {
    if (pass === "admin123") { setAuthed(true); setPassErr(false); }
    else setPassErr(true);
  };

  const logout = () => {
    setAuthed(false);
    setPass("");
    setPassErr(false);
    setRows([]);
    setDbStatus("idle");
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <Card style={{ maxWidth: 440, margin: "0 auto", textAlign: "center", padding: 44 }}>
        <img
          src={IMG.logo}
          alt="Logo"
          style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 16, marginBottom: 18, border: `3px solid ${C.border}` }}
        />
        <Title center size={24}>Admin Login</Title>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 26, fontWeight: 600 }}>
          Password hint:{" "}
          <code style={{ background: C.goldPale, padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>admin123</code>
        </p>
        <Field label="Password" error={passErr ? "Incorrect password. Hint: admin123" : null}>
          <input
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setPassErr(false); }}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Enter admin password"
            style={iStyle}
          />
        </Field>
        <GoldBtn onClick={login} full large>Log In to Dashboard</GoldBtn>
      </Card>
    );
  }

  // ── Derived stats ──
  const confirmed = rows.filter(b => b.status === "Confirmed").length;
  const pending   = rows.filter(b => b.status === "Pending").length;
  const revenue   = rows.reduce((s, b) => s + parseInt((b.amount || "0").replace("$", ""), 10), 0);
  const unique    = new Set(rows.map(b => b.email)).size;

  // ── Client-side filter (Supabase also filters but this keeps the UI fast) ──
  const filtered = rows.filter(b => {
    const matchFilter = filter === "all" || (b.status || "").toLowerCase() === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (b.name    || "").toLowerCase().includes(q)
      || (b.email   || "").toLowerCase().includes(q)
      || (b.teacher || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Demo search filter ──
  const filteredDemos = demos.filter(d => {
    const q = demoSearch.toLowerCase();
    return !q
      || (d.name           || "").toLowerCase().includes(q)
      || (d.email          || "").toLowerCase().includes(q)
      || (d.preferred_slot || "").toLowerCase().includes(q)
      || (d.english_level  || "").toLowerCase().includes(q);
  });

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <Eyebrow>Admin Portal</Eyebrow>
          <Title size={30}>Admin Dashboard</Title>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <DbPill status={dbStatus} />
          <button
            onClick={loadData}
            style={{ background: C.goldLight, border: `2px solid ${C.border}`, borderRadius: 9, padding: "8px 14px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", color: C.navy }}
          >
            {loading ? "⏳" : "🔄"} Refresh
          </button>
          <SecBtn onClick={logout}>Log Out</SecBtn>
        </div>
      </div>

      {/* ── Setup notice if Supabase not connected ── */}
      {dbStatus === "error" && <SetupNotice />}

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard icon="📚" label="Total Bookings"  value={rows.length}    color={C.navy}    />
        <StatCard icon="✅" label="Confirmed"        value={confirmed}      color="#0B7A70"   />
        <StatCard icon="⏳" label="Pending"          value={pending}        color={C.goldDark}/>
        <StatCard icon="💰" label="Revenue"          value={`$${revenue}`}  color={C.navy}    />
        <StatCard icon="👥" label="Unique Students"  value={unique}         color={C.teal}    />
        <StatCard icon="🎯" label="Demo Requests"    value={demos.length}   color={C.purple}  />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <TabBtn active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} badge={rows.length}>
          📚 Student Bookings
        </TabBtn>
        <TabBtn active={activeTab === "demos"} onClick={() => setActiveTab("demos")} badge={demos.length}>
          🎯 Demo Requests
        </TabBtn>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── BOOKINGS TAB ── */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === "bookings" && (
        <>
          {/* ── Search + filter bar ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search students…"
              style={{ ...iStyle, maxWidth: 260, padding: "10px 14px" }}
            />
            {["all", "confirmed", "pending"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background:    filter === f ? C.gold : "#fff",
                  color:         filter === f ? C.navy : C.muted,
                  border:        `2px solid ${filter === f ? C.gold : C.border}`,
                  padding:       "9px 18px",
                  borderRadius:  10,
                  fontFamily:    "'Nunito',sans-serif",
                  fontWeight:    700,
                  fontSize:      13,
                  cursor:        "pointer",
                  textTransform: "capitalize",
                  transition:    "all .15s",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginLeft: 4 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Bookings table ── */}
          <Card pad={0} style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted, fontWeight: 700, fontSize: 15 }}>
                  <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1s infinite" }}>⏳</div>
                  Loading bookings from Supabase…
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.navy }}>
                      {["#","Student","Email","Teacher","Schedule","Level","Package","Amount","Status","Date"].map(h => (
                        <th key={h} style={{
                          textAlign: "left", padding: "13px 15px",
                          fontSize: 11, textTransform: "uppercase",
                          letterSpacing: ".07em", color: C.gold,
                          fontWeight: 800, whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontWeight: 600, fontSize: 15 }}>
                          No bookings found. 🔍
                        </td>
                      </tr>
                    ) : (
                      filtered.map((b, i) => (
                        <tr
                          key={b.id || i}
                          style={{ borderBottom: `1.5px solid ${C.borderLight}`, transition: "background .15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.goldPale)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "13px 15px", color: "#ccc", fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 800, color: C.navy, whiteSpace: "nowrap" }}>{b.name}</td>
                          <td style={{ padding: "13px 15px", color: C.teal, fontWeight: 600 }}>{b.email}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 700, whiteSpace: "nowrap" }}>{b.teacher}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 600, whiteSpace: "nowrap" }}>{b.slot}</td>
                          <td style={{ padding: "13px 15px" }}>
                            <span style={{ background: C.goldLight, color: C.goldDark, fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>
                              {b.level}
                            </span>
                          </td>
                          <td style={{ padding: "13px 15px", fontWeight: 600 }}>{b.pkg}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 800, color: C.goldDark }}>{b.amount}</td>
                          <td style={{ padding: "13px 15px" }}>
                            <span style={{
                              background: b.status === "Confirmed" ? C.tealLight : C.goldLight,
                              color:      b.status === "Confirmed" ? "#0B7A70"   : C.goldDark,
                              fontSize: 11, fontWeight: 800,
                              padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap",
                            }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: "13px 15px", color: C.muted, fontWeight: 600 }}>
                            {b.date || (b.created_at ? b.created_at.slice(0, 10) : "—")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── DEMO REQUESTS TAB ── */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === "demos" && (
        <>
          {/* ── Demo stats mini row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 14, marginBottom: 22 }}>
            <StatCard icon="🎯" label="Total Requests"  value={demos.length}  color={C.purple} />
            <StatCard icon="📅" label="This Month"
              value={demos.filter(d => {
                const m = new Date(); const c = new Date(d.created_at);
                return c.getMonth() === m.getMonth() && c.getFullYear() === m.getFullYear();
              }).length}
              color={C.teal}
            />
            <StatCard icon="👤" label="Unique Emails"
              value={new Set(demos.map(d => d.email)).size}
              color={C.navy}
            />
          </div>

          {/* ── Demo search bar ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={demoSearch}
              onChange={e => setDemoSearch(e.target.value)}
              placeholder="🔍 Search demo requests…"
              style={{ ...iStyle, maxWidth: 300, padding: "10px 14px" }}
            />
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginLeft: 4 }}>
              {filteredDemos.length} result{filteredDemos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Demo Requests table ── */}
          <Card pad={0} style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: C.muted, fontWeight: 700, fontSize: 15 }}>
                  <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 1s infinite" }}>⏳</div>
                  Loading demo requests from Supabase…
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: C.navy }}>
                      {["#", "Name", "Email", "Preferred Slot", "English Level", "Submitted On"].map(h => (
                        <th key={h} style={{
                          textAlign: "left", padding: "13px 15px",
                          fontSize: 11, textTransform: "uppercase",
                          letterSpacing: ".07em", color: C.gold,
                          fontWeight: 800, whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDemos.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontWeight: 600, fontSize: 15 }}>
                          No demo requests found. 🔍
                        </td>
                      </tr>
                    ) : (
                      filteredDemos.map((d, i) => (
                        <tr
                          key={d.id || i}
                          style={{ borderBottom: `1.5px solid ${C.borderLight}`, transition: "background .15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.goldPale)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "13px 15px", color: "#ccc", fontWeight: 700 }}>{i + 1}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 800, color: C.navy, whiteSpace: "nowrap" }}>{d.name || "—"}</td>
                          <td style={{ padding: "13px 15px", color: C.teal, fontWeight: 600 }}>{d.email || "—"}</td>
                          <td style={{ padding: "13px 15px", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {d.preferred_slot ? (
                              <span style={{ background: C.tealLight, color: "#0B7A70", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>
                                {d.preferred_slot}
                              </span>
                            ) : "—"}
                          </td>
                          <td style={{ padding: "13px 15px" }}>
                            {d.english_level ? (
                              <span style={{ background: "#EDE9FE", color: "#5B21B6", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>
                                {d.english_level}
                              </span>
                            ) : "—"}
                          </td>
                          <td style={{ padding: "13px 15px", color: C.muted, fontWeight: 600 }}>
                            {d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
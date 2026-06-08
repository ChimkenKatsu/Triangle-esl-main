import IMG from "../../data/images";
import C from "../../styles/theme";
import { NavBtn, GoldBtn } from "../ui";

const NAV_LINKS = [
  { id: "home",     label: "About"       },
  { id: "teachers", label: "Teachers"    },
  { id: "pricing",  label: "Packages"    },
  { id: "booking",  label: "Book a Class"},
];

export default function Navbar({ page, go, onDemo }) {
  return (
    <nav style={{
      background:   C.navy,
      position:     "sticky",
      top:          0,
      zIndex:       200,
      borderBottom: `3px solid ${C.gold}`,
      boxShadow:    "0 4px 28px rgba(14,24,41,.5)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding:  "0 24px",
        display:  "flex", alignItems: "center", height: 68, gap: 2,
      }}>
        {/* Logo */}
        <div
          onClick={() => go("home")}
          style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginRight:"auto", flexShrink:0 }}
        >
          <img
            src={IMG.logo}
            alt="Triangle ESL"
            style={{ width:44, height:44, objectFit:"contain", borderRadius:10, border:"2px solid rgba(245,166,35,.4)" }}
          />
          <div>
            <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:18, fontWeight:900, color:C.gold, lineHeight:1.1, letterSpacing:".02em" }}>
              TRIANGLE ESL
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,.38)", fontWeight:800, letterSpacing:".08em", lineHeight:1 }}>
              LEARN MORE · SPEAK MORE · CONNECT MORE
            </div>
          </div>
        </div>

        {/* Nav links */}
        {NAV_LINKS.map(n => (
          <NavBtn key={n.id} active={page === n.id} onClick={() => go(n.id)}>
            {n.label}
          </NavBtn>
        ))}

        {/* CTA */}
        <GoldBtn
          onClick={onDemo}
          style={{ marginLeft: 10, whiteSpace: "nowrap" }}
        >
          📋 Free Demo
        </GoldBtn>
      </div>
    </nav>
  );
}
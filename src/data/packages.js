import C from "../styles/theme";

const PACKAGES = [
  {
    id:       "single",
    label:    "Single Class",
    sessions: 1,
    price:    15,
    icon:     "🎯",
    badge:    null,
    per:      null,
    color:    C.teal,
    rgb:      "58,191,177",
  },
  {
    id:       "starter",
    label:    "Starter Pack",
    sessions: 8,
    price:    99,
    icon:     "⭐",
    badge:    "POPULAR",
    per:      "$12.38",
    color:    C.gold,
    rgb:      "245,166,35",
  },
  {
    id:       "pro",
    label:    "Pro Pack",
    sessions: 20,
    price:    220,
    icon:     "🚀",
    badge:    "BEST VALUE",
    per:      "$11.00",
    color:    C.purple,
    rgb:      "124,58,237",
  },
  {
    id:       "premium",
    label:    "Premium Pack",
    sessions: 40,
    price:    399,
    icon:     "💎",
    badge:    null,
    per:      "$9.98",
    color:    C.navy,
    rgb:      "14,24,41",
  },
];

export default PACKAGES;

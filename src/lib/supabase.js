// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SUPABASE CONFIG
//  1. Go to https://supabase.com and create a free project.
//  2. Copy your Project URL and anon/public API key here.
//  3. Create these two tables in the Supabase SQL editor:
//
//  CREATE TABLE bookings (
//    id          bigserial primary key,
//    name        text, email text, teacher text, slot text,
//    level       text, pkg text, amount text,
//    status      text default 'Confirmed',
//    date        text,
//    created_at  timestamptz default now()
//  );
//
//  CREATE TABLE demo_requests (
//    id              bigserial primary key,
//    name            text, email text,
//    preferred_slot  text, english_level text,
//    created_at      timestamptz default now()
//  );
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SUPABASE_URL      = "https://csetnjpmycctsdkdudqh.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZXRuanBteWNjdHNka2R1ZHFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzU1NjYsImV4cCI6MjA5NTg1MTU2Nn0.9T3K7Up0nW98JUl4lmALeE3OBGDn1ZlLfE0iM-uK7lc";

// Lightweight REST wrapper — no npm package required
const supabase = {
  _url: SUPABASE_URL,
  _key: SUPABASE_ANON_KEY,

  _headers() {
    return {
      "Content-Type":  "application/json",
      "apikey":        this._key,
      "Authorization": `Bearer ${this._key}`,
    };
  },

  /** Fetch rows from a table with optional search + status filter */
  async select(table, { search = "", filter = "all" } = {}) {
    let url =
      `${this._url}/rest/v1/${table}?select=*&order=id.desc`;

    if (search) {
      url += `&or=(name.ilike.*${search}*,email.ilike.*${search}*)`;
    }

    if (filter && filter !== "all") {
      url += `&status=eq.${filter}`;
    }

    const r = await fetch(url, {
      headers: this._headers(),
    });

    if (!r.ok) {
      throw new Error(await r.text());
    }

    return r.json();
  },

  // ────────────────────────────────────────────────────────
  // Generic INSERT
  // ────────────────────────────────────────────────────────
  async insert(table, data) {
    const r = await fetch(
      `${this._url}/rest/v1/${table}`,
      {
        method: "POST",
        headers: {
          ...this._headers(),
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      }
    );

    if (!r.ok) {
      throw new Error(await r.text());
    }

    return r.json();
  },

  // ────────────────────────────────────────────────────────
  // BOOKINGS
  // ────────────────────────────────────────────────────────

  async insertBooking(data) {
    return this.insert("bookings", data);
  },

  async getBookings() {
    return this.select("bookings");
  },

  // ────────────────────────────────────────────────────────
  // DEMO REQUESTS
  // ────────────────────────────────────────────────────────

  async insertDemo(data) {
    return this.insert("demo_requests", data);
  },

  async getDemoRequests() {
    return this.select("demo_requests");
  },

  // ────────────────────────────────────────────────────────
  // DASHBOARD HELPERS
  // ────────────────────────────────────────────────────────

  async getDashboardData() {
    const [bookings, demos] = await Promise.all([
      this.getBookings(),
      this.getDemoRequests(),
    ]);

    return {
      bookings,
      demos,
    };
  },
};

export default supabase;
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Supabase Configuration ──────────────────────────────────
  const SUPABASE_URL = (process.env.SUPABASE_URL || "")
    .replace(/\/$/, "")
    .replace(/\/rest\/v1$/, "");
  const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("❌ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY in .env");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log("✅ Supabase client initialized:", SUPABASE_URL);

  // ── Helper ──────────────────────────────────────────────────
  function logError(context: string, err: any) {
    console.error(`\n[Supabase ERROR] ${context}`);
    console.error("  message:", err?.message);
    console.error("  code   :", err?.code);
    console.error("  details:", err?.details);
    console.error("  hint   :", err?.hint);
  }

  // ── personnel ───────────────────────────────────────────────
  app.get("/api/personnel", async (req, res) => {
    try {
      const { data, error } = await supabase.from("personnel").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logError("GET personnel", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ลบกำลังพล + cascade ลบ BookingLog และ DutyRoster ที่เกี่ยวข้อง
  app.delete("/api/personnel/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] personnel id=${id}`);
    try {
      // cascade ลบก่อน (ถ้า Supabase ไม่ได้ตั้ง FK cascade ไว้)
      await supabase.from("BookingLog").delete().eq("personnelId", id);
      await supabase.from("DutyRoster").delete().eq("personnelId", id);

      const { error } = await supabase.from("personnel").delete().eq("id", id);
      if (error) throw error;

      console.log(`[DELETE] personnel ${id} — OK`);
      res.json({ status: "success" });
    } catch (err: any) {
      logError(`DELETE personnel id=${id}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── year_plan ───────────────────────────────────────────────
  app.get("/api/year-plan", async (req, res) => {
    try {
      const { data, error } = await supabase.from("year_plan").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logError("GET year_plan", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/year-plan", async (req, res) => {
    console.log("[POST] year_plan:", req.body);
    try {
      const { data, error } = await supabase.from("year_plan").insert([req.body]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      logError("POST year_plan", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/year-plan/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[PUT] year_plan id=${id}:`, req.body);
    try {
      const { data, error } = await supabase
        .from("year_plan").update(req.body).eq("id", id).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      logError(`PUT year_plan id=${id}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // ลบแผนงาน + cascade ลบ BookingLog ที่อ้างถึง eventId นี้
  app.delete("/api/year-plan/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] year_plan id=${id}`);
    try {
      // ลบ booking ที่อ้างถึง event นี้ก่อน
      const { data: deletedBookings } = await supabase
        .from("BookingLog").delete().eq("eventId", id).select();
      console.log(`[DELETE] cascade removed ${deletedBookings?.length ?? 0} BookingLog(s) for eventId=${id}`);

      const { error } = await supabase.from("year_plan").delete().eq("id", id);
      if (error) throw error;

      console.log(`[DELETE] year_plan ${id} — OK`);
      res.json({ status: "success" });
    } catch (err: any) {
      logError(`DELETE year_plan id=${id}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── BookingLog ──────────────────────────────────────────────
  app.get("/api/booking-log", async (req, res) => {
    try {
      const { data, error } = await supabase.from("BookingLog").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logError("GET BookingLog", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/booking", async (req, res) => {
    console.log("[POST] BookingLog:", req.body);
    try {
      const payload = {
        ...req.body,
        timestamp: req.body.timestamp || new Date().toISOString(),
      };
      const { data, error } = await supabase.from("BookingLog").insert([payload]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      logError("POST BookingLog", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/booking/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] BookingLog id=${id}`);
    try {
      const { error } = await supabase.from("BookingLog").delete().eq("id", id);
      if (error) throw error;
      console.log(`[DELETE] BookingLog ${id} — OK`);
      res.json({ status: "success" });
    } catch (err: any) {
      logError(`DELETE BookingLog id=${id}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── DutyRoster ──────────────────────────────────────────────
  app.get("/api/duty-roster", async (req, res) => {
    try {
      const { data, error } = await supabase.from("DutyRoster").select("*");
      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      logError("GET DutyRoster", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/duty-roster", async (req, res) => {
    console.log("[POST] DutyRoster:", req.body);
    try {
      const { data, error } = await supabase.from("DutyRoster").insert([req.body]).select();
      if (error) throw error;
      res.json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      logError("POST DutyRoster", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/duty-roster/:id", async (req, res) => {
    const { id } = req.params;
    console.log(`[DELETE] DutyRoster id=${id}`);
    try {
      const { error } = await supabase.from("DutyRoster").delete().eq("id", id);
      if (error) throw error;
      console.log(`[DELETE] DutyRoster ${id} — OK`);
      res.json({ status: "success" });
    } catch (err: any) {
      logError(`DELETE DutyRoster id=${id}`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── Vite / Static ───────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer();
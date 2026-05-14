import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

// โหลดค่าจากไฟล์ .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // ── Middleware ──────────────────────────────────────────────
  app.use(cors()); // อนุญาตให้ Frontend เชื่อมต่อ API ได้โดยไม่ติดปัญหา CORS
  app.use(express.json());

  // ── Supabase Configuration ──────────────────────────────────
  // แก้ไขปัญหาชื่อตัวแปรไม่ตรงกัน โดยเช็คทั้งแบบมี VITE_ และไม่มี
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const SUPABASE_URL = rawUrl.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
  const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Error: Missing Supabase credentials in .env");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log("✅ Supabase client initialized:", SUPABASE_URL);

  // ── Helper สำหรับจัดการ Error ────────────────────────────────
  function handleSupabaseError(res: express.Response, error: any, context: string) {
    console.error(`\n[Supabase ERROR] @ ${context}`);
    console.error("  Message:", error?.message);
    console.error("  Code:", error?.code);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error?.message,
      context
    });
  }

  // ── API Routes (ตัวอย่างการจัดการ Personnel) ──────────────────
  
  // ลบข้อมูลบุคลากร
  app.delete("/api/personnel/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // 1. ลบข้อมูลที่เกี่ยวข้องในตารางอื่นก่อน (ถ้าไม่ได้ตั้ง Cascade ไว้ใน DB)
      const { error: logError } = await supabase
        .from("BookingLog")
        .delete()
        .eq("personnel_id", id);
      
      if (logError) return handleSupabaseError(res, logError, "Delete BookingLog");

      // 2. ลบข้อมูลบุคลากรหลัก
      const { error: perError } = await supabase
        .from("Personnel")
        .delete()
        .eq("id", id);

      if (perError) return handleSupabaseError(res, perError, "Delete Personnel");

      res.json({ status: "success", message: `Deleted personnel ${id}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // เพิ่มข้อมูลเข้า DutyRoster
  app.post("/api/duty-roster", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("DutyRoster")
        .insert([req.body])
        .select();

      if (error) return handleSupabaseError(res, error, "Insert DutyRoster");
      
      res.status(201).json(data ? data[0] : { status: "success" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Vite Integration / Static Files ────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // สำหรับ Production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("🔥 Failed to start server:", err);
});

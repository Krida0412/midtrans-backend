/* ---------- Env & Lib ---------- */
require("dotenv").config();
const express        = require("express");
const cors           = require("cors");
const midtransClient = require("midtrans-client");

const reverseRoute   = require("./reverse");

const app  = express();
const PORT = process.env.PORT || 4000;

/* ---------- Middleware global ---------- */
// Izinkan semua origin (ganti 'origin' jika ingin spesifik Vercel saja)
app.use(cors());
app.use(express.json());          // parse JSON body

/* ---------- Midtrans Snap client ---------- */
const snap = new midtransClient.Snap({
  isProduction: false,                     // ← ganti true di production
  serverKey   : process.env.MIDTRANS_SERVER_KEY,
});

/* ===================================================== */
/* ================     ROUTES SECTION     ============== */
/* ===================================================== */

/* -- PRE-FLIGHT handler untuk /api/transaction --------- */
// Browser akan kirim OPTIONS terlebih dulu sebelum POST.
// Baris ini menjawab OPTIONS → 204 No Content
app.options("/api/transaction", cors());

/* -- POST /api/transaction  ->  Buat Snap token -------- */
app.post("/api/transaction", cors(), async (req, res) => {
  const { orderId, grossAmount, customerName } = req.body;

  if (!orderId || !grossAmount) {
    return res.status(400).json({
      message: "orderId & grossAmount wajib diisi",
    });
  }

  try {
    const parameter = {
      transaction_details: {
        order_id   : orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName || "Pelanggan",
      },
    };

    const { token, redirect_url } = await snap.createTransaction(parameter);
    return res.json({ token, redirect_url });
  } catch (err) {
    console.error("Midtrans Error:", err.message);
    return res.status(500).json({ message: "Gagal membuat transaksi" });
  }
});

/* -- GET /api/reverse  ->  proxy OSM bebas-CORS -------- */
app.use("/api/reverse", reverseRoute);

/* ---------- Start server ---------- */
app.listen(PORT, () => {
  console.log(`✅ Backend jalan di http://localhost:${PORT}`);
});

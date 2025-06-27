/* ---------- Env & Lib ---------- */
require("dotenv").config();
const express        = require("express");
const cors           = require("cors");
const midtransClient = require("midtrans-client");
const reverseRoute   = require("./reverse");

const app  = express();
const PORT = process.env.PORT || 4000;

/* ---------- Konfigurasi CORS ---------- */
const ALLOWED_ORIGIN = "https://food-delivery-gray-theta.vercel.app"; // ganti/add origin lain bila perlu

const corsOptions = {
  origin            : ALLOWED_ORIGIN,   // atau (origin, cb) => cb(null, true) untuk semua
  methods           : ["GET", "POST", "OPTIONS"],
  allowedHeaders    : ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204            // status utk legacy browser
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔓 Pastikan SEMUA pre-flight dijawab
app.options("*", cors(corsOptions));

/* ---------- Midtrans Snap client ---------- */
const snap = new midtransClient.Snap({
  isProduction: false,                       // ← true di production
  serverKey   : process.env.MIDTRANS_SERVER_KEY,
});

/* ===================================================== */
/* =====================  ROUTES  ====================== */
/* ===================================================== */

/* -- POST /api/transaction  ->  Buat Snap token -------- */
app.post("/api/transaction", async (req, res) => {
  const { orderId, grossAmount, customerName } = req.body;
  if (!orderId || !grossAmount)
    return res.status(400).json({ message: "orderId & grossAmount wajib diisi" });

  try {
    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      customer_details   : { first_name: customerName || "Pelanggan" },
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

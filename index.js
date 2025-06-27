/* ---------- Env & Lib ---------- */
require("dotenv").config();
const express        = require("express");
const cors           = require("cors");
const midtransClient = require("midtrans-client");
const reverseRoute   = require("./reverse");

const app  = express();
const PORT = process.env.PORT;
if (!PORT) {
  console.error("❌ PORT env tidak tersedia!");  // Railway pasti menyediakannya
  process.exit(1);
}

/* ---------- Konfigurasi CORS ---------- */
const ALLOWED_ORIGIN = "https://food-delivery-gray-theta.vercel.app";

const corsOptions = {
  origin: ALLOWED_ORIGIN,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));   // sudah cukup untuk pre-flight
app.use(express.json());

/* ---------- Midtrans Snap client ---------- */
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey   : process.env.MIDTRANS_SERVER_KEY,
});

/* ------------ ROUTES ------------ */

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

app.use("/api/reverse", reverseRoute);

/* ---------- Start server ---------- */
app.listen(PORT, () => {
  console.log(`✅ Backend listen di port ${PORT}`);
});

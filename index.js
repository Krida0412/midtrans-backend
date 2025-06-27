require("dotenv").config();
const express        = require("express");
const cors           = require("cors");
const midtransClient = require("midtrans-client");

const reverseRoute   = require("./reverse");

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ------ Midtrans Snap client ------
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// POST /api/transaction  –– buat Snap token
app.post("/api/transaction", async (req, res) => {
  const { orderId, grossAmount, customerName } = req.body;
  if (!(orderId && grossAmount))
    return res.status(400).json({ message: "orderId & grossAmount wajib diisi" });

  try {
    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      customer_details   : { first_name: customerName || "Pelanggan" },
    };

    const { token, redirect_url } = await snap.createTransaction(parameter);
    res.json({ token, redirect_url });
  } catch (err) {
    console.error("Midtrans Error:", err.message);
    res.status(500).json({ message: "Gagal membuat transaksi" });
  }
});

// GET /api/reverse –– bebas-CORS proxy OSM
app.use("/api/reverse", reverseRoute);

app.listen(PORT, () => {
  console.log(`✅ Backend jalan di http://localhost:${PORT}`);
});

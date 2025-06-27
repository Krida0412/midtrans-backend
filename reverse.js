const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

const router = express.Router();

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat & lon harus diisi" });

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const data = await fetch(url, {
      headers: { "User-Agent": "foodie-demo/1.0" },
    }).then((r) => r.json());

    res.json({ display_name: data.display_name || `${lat}, ${lon}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "reverse geocode gagal" });
  }
});

module.exports = router;

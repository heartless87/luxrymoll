import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  // ---------- CORS ----------
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // --------------------------

  try {
    const uri = process.env.MONGO_URI;

    // 🔥 reuse Mongo connection
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("Prodlist");

    let page = Number(req.query.page);
    if (!page || page < 1) page = 1;

    const limit = 12;
    const skip = (page - 1) * limit;

    const docs = await col
      .find({})
      .sort({ createdAt: -1 }) // ⭐ latest first
      .skip(skip)
      .limit(limit)
      .toArray();

    // ⭐ stable & backward-compatible converter
    function toDataUri(str) {
      if (!str) return "";

      const s = String(str).trim();

      if (s.startsWith("data:image/")) return s;
      if (s.startsWith("/9j/")) return `data:image/jpeg;base64,${s}`;
      if (s.startsWith("iVBOR")) return `data:image/png;base64,${s}`;

      const cleaned = s.replace(/^\/+/, "");
      return `data:image/jpeg;base64,${cleaned}`;
    }

    const out = docs.map(p => {
      const images = [];

      for (let i = 1; i <= 7; i++) {
        const key = `image-${i}`;
        if (p[key]) images.push(toDataUri(p[key]));
      }

      return {
        _id: p._id,
        title: p.title,
        description: p.description,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        images
      };
    });

    return res.status(200).json(out);

  } catch (err) {
    console.error("getProducts Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

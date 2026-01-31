import { MongoClient } from "mongodb";
let cachedClient = null;
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const uri = process.env.MONGO_URI;
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    const db = cachedClient.db("Product");
    const col = db.collection("Prodlist");
    const limit = 12;
    const rand = Math.random();
    let docs = await col
      .find({ randomKey: { $gte: rand } })
      .limit(limit)
      .toArray();
    if (docs.length < limit) {
      const extra = await col
        .find({ randomKey: { $lt: rand } })
        .limit(limit - docs.length)
        .toArray();
      docs = docs.concat(extra);
    }
    function toDataUri(str) {
      if (!str) return "";
      const s = String(str).trim();
      if (s.startsWith("data:image/")) return s;
      if (s.startsWith("/9j/")) return `data:image/jpeg;base64,${s}`;
      if (s.startsWith("iVBOR")) return `data:image/png;base64,${s}`;
      return `data:image/jpeg;base64,${s.replace(/^\/+/, "")}`;
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
        description: p.description || "",
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

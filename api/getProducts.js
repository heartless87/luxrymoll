import { MongoClient, ObjectId } from "mongodb";
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
    let docs;
    if (req.query.ids && req.query.ids.trim() !== "") {
      const rawIds = req.query.ids.split(",");
      const objectIds = [];
      for (const id of rawIds) {
        try {
          if (ObjectId.isValid(id)) {
            objectIds.push(new ObjectId(id));
          }
        } catch (_) {
        }
      }
      if (!objectIds.length) {
        docs = [];
      } else {
        docs = await col.find({
          _id: { $in: objectIds }
        }).toArray();
      }
    } else {
      docs = await col.aggregate([
        { $sample: { size: 12 } }
      ]).toArray();
    }
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

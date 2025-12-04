// api/getProducts.js
import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop"); // या "*" during dev
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("Product");
    const col = db.collection("Prodlist");

    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const docs = await col.find({}).skip(skip).limit(limit).toArray();

    // helper: turn stored string into a full data URI
    function toDataUri(str) {
      if (!str) return "";
      const s = String(str).trim();
      // already a data URI?
      const m = s.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
      if (m) return `data:${m[1]};base64,${m[2]}`;
      // if it looks like base64 without prefix (starts with /9j or iVBOR...)
      const cleaned = s.replace(/^\/+/, ""); // remove accidental leading slashes
      // default to jpeg if mime unknown
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

    res.status(200).json(out);
  } catch (err) {
    console.error("getProducts Error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
}

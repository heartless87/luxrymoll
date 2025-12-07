// api/getProduct.js
import { MongoClient, ObjectId } from "mongodb";

export default async function handler(req, res) {

  // ⭐ CORS (same as getProducts)
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("Product");
    const col = db.collection("Prodlist");

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing product id" });

    const p = await col.findOne({ _id: new ObjectId(id) });
    if (!p) return res.status(404).json({ error: "Product not found" });

    // ⭐ SAME image converter used in getProducts
    function toDataUri(str) {
      if (!str) return "";
      const s = String(str).trim();
      const m = s.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
      if (m) return s;
      const cleaned = s.replace(/^\/+/, "");
      return `data:image/jpeg;base64,${cleaned}`;
    }

    const images = [];
    for (let i = 1; i <= 7; i++) {
      const key = `image-${i}`;
      if (p[key]) images.push(toDataUri(p[key]));
    }

    const out = {
      _id: p._id,
      title: p.title,
      description: p.description,
      originalPrice: p.originalPrice,
      sellingPrice: p.sellingPrice,
      images
    };

    res.status(200).json(out);

  } catch (err) {
    console.error("getProduct Error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
}

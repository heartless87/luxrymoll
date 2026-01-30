import { MongoClient, ObjectId } from "mongodb";

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
    const id = req.query.id;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const uri = process.env.MONGO_URI;

    // 🔥 reuse Mongo connection
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("Prodlist");

    const p = await col.findOne({ _id: new ObjectId(id) });
    if (!p) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 🔥 simple & safe image formatter
    const images = [];
    for (let i = 1; i <= 7; i++) {
      const img = p[`image-${i}`];
      if (!img) continue;

      if (img.startsWith("data:image/")) {
        images.push(img);
      } else {
        images.push(`data:image/jpeg;base64,${img}`);
      }
    }

    return res.status(200).json({
      _id: p._id,
      title: p.title,
      description: p.description,
      originalPrice: p.originalPrice,
      sellingPrice: p.sellingPrice,
      images
    });

  } catch (err) {
    console.error("getProduct Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

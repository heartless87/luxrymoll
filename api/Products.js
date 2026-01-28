import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  // ---------------- CORS ----------------
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // -------------------------------------

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const uri = process.env.MONGO_URI;

    // 🔥 reuse Mongo connection
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("Prodlist");

    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const products = await col.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = products.map(p => {
      const images = [];

      for (let i = 1; i <= 7; i++) {
        const img = p[`image-${i}`];
        if (!img) continue;

        // 🔥 clean only if needed
        if (img.startsWith("data:image/")) {
          images.push(img.split(",")[1]);
        } else {
          images.push(img);
        }
      }

      return {
        _id: p._id,
        title: p.title,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        images
      };
    });

    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Products API Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

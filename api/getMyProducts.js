import { MongoClient } from "mongodb";
let cachedClient = null;
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("Prodlist");

    const products = await col
      .find({ sellerEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    const out = products.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      originalPrice: p.originalPrice,
      sellingPrice: p.sellingPrice,
      image: p["image-1"]
        ? p["image-1"].startsWith("data:image/")
          ? p["image-1"]
          : `data:image/jpeg;base64,${p["image-1"]}`
        : ""
    }));

    return res.status(200).json(out);
  } catch (err) {
    console.error("getMyProducts Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

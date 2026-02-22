import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  // 🌍 CORS
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { email, productId, action } = req.body || {};

    if (!email || !productId || !action) {
      return res.status(400).json({ success: false });
    }

    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("favo");

    const cleanEmail = email.toLowerCase().trim();

    if (action === "like") {
      await col.updateOne(
        { email: cleanEmail },
        { $addToSet: { products: productId } },
        { upsert: true }
      );
    }

    if (action === "unlike") {
      await col.updateOne(
        { email: cleanEmail },
        { $pull: { products: productId } }
      );
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Favorites Error:", err);
    return res.status(500).json({ success: false });
  }
}

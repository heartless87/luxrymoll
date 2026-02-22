import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { email, productId } = req.body || {};

    if (!email || !productId) {
      return res.status(400).json({ success: false });
    }

    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");
    const col = db.collection("favo");

    await col.updateOne(
      { email: email.toLowerCase().trim() },
      { $addToSet: { products: productId } },
      { upsert: true }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

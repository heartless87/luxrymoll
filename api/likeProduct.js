import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  // 🔥 CORS — SAME for ALL requests
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ PRE-FLIGHT (MOST IMPORTANT)
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

    const db = cachedClient.db("user");
    const col = db.collection("data");

    await col.updateOne(
      { email: email.toLowerCase() },
      {
        $addToSet: {
          likedProducts: productId
        }
      }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

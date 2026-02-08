import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
  // 🔥 CORS (VERY IMPORTANT)
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, productId } = req.body;

    if (!email || !productId) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    // 🔥 Mongo connect (reuse connection – Vercel friendly)
    if (!cachedClient) {
      cachedClient = new MongoClient(process.env.MONGO_URI);
      await cachedClient.connect();
    }

    const db = cachedClient.db("user");
    const col = db.collection("data");

    // ✅ ONLY productId add hoga, kuch delete nahi hoga
    await col.updateOne(
      { email: email.toLowerCase() },
      {
        $addToSet: {
          likedProducts: productId
        }
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("LikeProduct Error:", err);
    return res.status(500).json({ success: false });
  }
}

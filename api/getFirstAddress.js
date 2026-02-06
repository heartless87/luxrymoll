import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  // ✅ CORS — MUST BE AT TOP
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false });
  }

  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ success: false });
    }

    const uri = process.env.MONGO_URI;
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("user");
    const col = db.collection("data");

    const user = await col.findOne({ email: email.toLowerCase() });

    if (!user || !user.addresses) {
      return res.status(200).json({
        success: true,
        address: null
      });
    }

    const firstAddress = Object.values(user.addresses)[0] || null;

    return res.status(200).json({
      success: true,
      address: firstAddress
    });

  } catch (err) {
    console.error("getFirstAddress Error:", err);
    return res.status(500).json({ success: false });
  }
}

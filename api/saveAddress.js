import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { email, address } = req.body;

    if (!email || !address) {
      return res.status(400).json({ success: false });
    }

    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("user");
    const col = db.collection("data");

    // 🔍 find user
    const user = await col.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false });
    }

    // 🔑 generate unique address key
    const addresses = user.addresses || {};
    const nextIndex = Object.keys(addresses).length + 1;
    const addressKey = `address${nextIndex}`;

    // 🧠 update ONLY addresses
    await col.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          [`addresses.${addressKey}`]: {
            ...address,
            createdAt: new Date()
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      addressKey
    });

  } catch (err) {
    console.error("saveAddress Error:", err);
    return res.status(500).json({ success: false });
  }
}

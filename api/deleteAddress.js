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
    const { email, addressId } = req.body;
    if (!email || !addressId) {
      return res.status(400).json({ success: false });
    }

    const uri = process.env.MONGO_URI;
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("user");
    const col = db.collection("data");

    // 🔥 delete ONLY that address key
    const userDoc = await col.findOne({ email: email.toLowerCase() });
    if (!userDoc || !userDoc.addresses) {
      return res.status(404).json({ success: false });
    }

    const addressKey = Object.keys(userDoc.addresses)
      .find(k => userDoc.addresses[k].addressId === addressId);

    if (!addressKey) {
      return res.status(404).json({ success: false });
    }

    await col.updateOne(
      { email: email.toLowerCase() },
      { $unset: { [`addresses.${addressKey}`]: "" } }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("deleteAddress Error:", err);
    return res.status(500).json({ success: false });
  }
}

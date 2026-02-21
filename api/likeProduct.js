import { MongoClient } from "mongodb";

let cachedClient = null;

async function connectDB() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { email, productId } = req.body || {};

    if (!email || !productId) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const client = await connectDB();
    const db = client.db("Product");
    const col = db.collection("favo");

    const cleanEmail = email.toLowerCase().trim();

    await col.updateOne(
      { email: cleanEmail },
      { $addToSet: { products: productId } },
      { upsert: true }
    );

    return res.status(200).json({ success: true, message: "Product liked" });

  } catch (err) {
    console.error("LIKE ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

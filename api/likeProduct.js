import { connectDB } from "./db.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false });

  try {
    const { email, productId } = req.body;

    if (!email || !productId) {
      return res.status(400).json({ success: false });
    }

    const col = await connectDB();

    await col.updateOne(
      { email: email.toLowerCase() },
      {
        $addToSet: {
          likedProducts: productId
        }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ success: false });
  }
}

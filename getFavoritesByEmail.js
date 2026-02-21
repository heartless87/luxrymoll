import { MongoClient, ObjectId } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("Product");

    // Step 1: find user favorites
    const favoCol = db.collection("favo");
    const userFavo = await favoCol.findOne({
      email: email.toLowerCase().trim()
    });

    if (!userFavo || !userFavo.products?.length) {
      return res.status(200).json([]);
    }

    // Step 2: fetch products from Prodlist
    const prodCol = db.collection("Prodlist");

    const objectIds = userFavo.products.map(id => new ObjectId(id));

    const products = await prodCol.find({
      _id: { $in: objectIds }
    }).toArray();

    return res.status(200).json(products);

  } catch (err) {
    console.error("Favorites Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please add your MONGO_URI to Vercel Environment Variables");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // Development — reuse global
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production (Vercel) — create new client once
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("Product");
    const collection = db.collection("Prodlist");

    const products = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = products.map(p => {
      const images = [];
      for (let i = 1; i <= 7; i++) {
        const key = `image-${i}`;
        if (p[key]) images.push(p[key]);
      }
      return {
        _id: p._id,
        title: p.title,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        images
      };
    });

    res.status(200).json(formatted);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

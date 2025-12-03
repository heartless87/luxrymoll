import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {

  // ⭐ CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("Product");
  const col = db.collection("Prodlist");

  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const products = await col.find({})
    .skip(skip)
    .limit(limit)
    .toArray();

  const clean = p =>
    p.replace("data:image/png;base64,", "")
     .replace("data:image/jpeg;base64,", "");

  const formatted = products.map(p => {
    const images = [];

    for (let i = 1; i <= 7; i++) {
      if (p[`image-${i}`]) images.push(clean(p[`image-${i}`]));
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
}

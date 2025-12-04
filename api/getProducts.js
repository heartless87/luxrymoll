import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db("Product");
  const col = db.collection("Prodlist");

  const page = Number(req.query.page) || 1;
  const limit = 12;
  const skip = (page-1)*limit;

  const docs = await col.find({}).skip(skip).limit(limit).toArray();

  // helper to normalize image -> return full data URI
  function toDataUri(str) {
    if (!str) return "";
    // If already data uri, return as-is
    const m = String(str).match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
    if (m) return `data:${m[1]};base64,${m[2]}`;
    // not a data uri — assume stored as raw base64; no mime info available => default to jpeg
    const cleaned = String(str).replace(/^\/+/, ''); // remove leading slashes if any
    return `data:image/jpeg;base64,${cleaned}`;
  }

  const out = docs.map(p => {
    const images = [];
    for (let i=1;i<=7;i++){
      const key = `image-${i}`;
      if (p[key]) images.push(toDataUri(p[key]));
    }
    return {
      _id: p._id,
      title: p.title,
      description: p.description,
      originalPrice: p.originalPrice,
      sellingPrice: p.sellingPrice,
      images
    };
  });

  res.status(200).json(out);
}

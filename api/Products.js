import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please add your MONGO_URI to Vercel Environment Variables");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Helper → Base64 prefix हटाने के लिए
function cleanBase64(str = "") {
  return str
    .replace("data:image/png;base64,", "")
    .replace("data:image/jpeg;base64,", "")
    .replace("data:image/jpg;base64,", "");
}

export default async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // 🔥 कम करके slow load friendly (Vercel free tier safe)
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("Product");
    const collection = db.collection("Prodlist");

    const products = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const formatted = products.map(p => {
      const images = [];

      // image-1 से image-7 तक check करो
      for (let i = 1; i <= 7; i++) {
        const key = `image-${i}`;
        if (p[key]) {
          images.push(cleanBase64(p[key]));
        }
      }

      return {
        // _id: p._id,     // ❌ Frontend को नहीं भेजना चाहते? इस लाइन को comment रखो
        _id: p._id,        // ✔ Backend में रख रहे हैं ताकि future use में काम आए
        title: p.title,
        description: p.description,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        images: images,
        createdAt: p.createdAt
      };
    });

    res.status(200).json(formatted);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

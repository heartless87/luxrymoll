import { MongoClient } from "mongodb";

export default async function handler(req, res) {

    // CORS FIX
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("Product");
    const col = db.collection("Prodlist");

    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const data = await col.find({})
        .skip(skip)
        .limit(limit)
        .toArray();

    // ⭐ Base64 Prefix Remove
    function clean(str = "") {
        return str
            .replace(/^data:image\/png;base64,/i, "")
            .replace(/^data:image\/jpeg;base64,/i, "")
            .replace(/^data:image\/jpg;base64,/i, "");
    }

    const formatted = data.map(p => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,

        // ⭐ अगर tum images array store कर रहे हो:
        images: (p.images || []).map(img => clean(img)),

        createdAt: p.createdAt
    }));

    res.status(200).json(formatted);
}

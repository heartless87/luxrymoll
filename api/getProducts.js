import { MongoClient } from "mongodb";

export default async function handler(req, res) {
    // CORS Fix
    res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("Product");
    const products = db.collection("Prodlist");

    const page = Number(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const data = await products.find({})
        .skip(skip)
        .limit(limit)
        .toArray();

    // remove base64 prefix
    const clean = str =>
        str.replace("data:image/png;base64,", "")
           .replace("data:image/jpeg;base64,", "");

    const formatted = data.map(p => ({
        _id: p._id,
        title: p.title,
        originalPrice: p.originalPrice,
        sellingPrice: p.sellingPrice,
        images: (p.images || []).map(clean)
    }));

    res.status(200).json(formatted);
}

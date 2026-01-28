import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

    // ---------------- CORS ----------------
    res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // --------------------------------------

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    let client;

    try {
        const uri = process.env.MONGO_URI;

        // 🔥 reuse Mongo connection (Vercel safe)
        if (!cachedClient) {
            cachedClient = new MongoClient(uri);
            await cachedClient.connect();
        }

        client = cachedClient;

        const db = client.db("Product");
        const collection = db.collection("Prodlist");

        const data = req.body;

        // 🔒 validation
        if (
            !data ||
            !data.title ||
            !data.description ||
            !data.originalPrice ||
            !data.sellingPrice ||
            !Array.isArray(data.images) ||
            data.images.length < 1
        ) {
            return res.status(400).json({ success: false, message: "Invalid product data" });
        }

        // Convert images array → image-1, image-2...
        const imageObj = {};
        data.images.slice(0, 7).forEach((img, index) => {
            imageObj[`image-${index + 1}`] = img;
        });

        const newProduct = {
            title: data.title,
            description: data.description,
            originalPrice: Number(data.originalPrice),
            sellingPrice: Number(data.sellingPrice),
            ...imageObj,
            createdAt: new Date()
        };

        await collection.insertOne(newProduct);

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("AddProduct Error:", err);
        return res.status(500).json({ success: false });
    }
}

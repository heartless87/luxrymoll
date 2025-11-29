import { MongoClient } from "mongodb";

export default async function handler(req, res) {

    // ---------------- GLOBAL CORS (ALWAYS ON) ----------------
    res.setHeader("Access-Control-Allow-Origin", "https://heartless87.github.io");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // ----------------------------------------------------------

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(200).json({});
    }

    // ----------------------------------------------------------
    // Only POST allowed
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    // ----------------------------------------------------------

    try {
        const uri = process.env.MONGO_URI;
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db("Product");
        const collection = db.collection("Prodlist");

        const data = req.body;

        // Convert images array → image-1, image-2...
        let imageObj = {};
        data.images.forEach((img, index) => {
            imageObj[`image-${index + 1}`] = img;
        });

        const newProduct = {
            title: data.title,
            description: data.description,
            originalPrice: data.originalPrice,
            sellingPrice: data.sellingPrice,
            ...imageObj,
            createdAt: new Date()
        };

        await collection.insertOne(newProduct);
        client.close();

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("AddProduct Error:", err);
        return res.status(500).json({ success: false });
    }
}

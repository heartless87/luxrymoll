import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
    throw new Error("Missing MONGO_URI in Vercel Environment Variables");
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

export default async function handler(req, res) {

    // ---------------- CORS FIX ----------------
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "https://heartless87.github.io"); 
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    // -------------------------------------------

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        const client = await clientPromise;
        const db = client.db("Product");
        const collection = db.collection("Prodlist");

        const data = req.body;

        // Convert images to image-1, image-2...
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

        return res.status(200).json({ success: true, message: "Product saved successfully!" });

    } catch (error) {
        console.error("Add Product Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

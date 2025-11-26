import { MongoClient } from "mongodb";

let client;
let clientPromise;

const uri = process.env.MONGO_URI;

if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Only POST allowed" });
    }

    try {
        const data = req.body;

        const client = await clientPromise;
        const db = client.db("Product");
        const collection = db.collection("Prodlist");

        // Format images as image-1, image-2, ...
        let imageObj = {};
        data.images.forEach((img, index) => {
            imageObj[`image-${index + 1}`] = img;
        });

        const productToSave = {
            title: data.title,
            description: data.description,
            originalPrice: data.originalPrice,
            sellingPrice: data.sellingPrice,
            ...imageObj,
            createdAt: new Date()
        };

        await collection.insertOne(productToSave);

        res.json({ success: true, message: "Product saved" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

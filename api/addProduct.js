export default async function handler(req, res) {

    // ---------- CORS FIX (WORKING FOR VERCEL) ----------
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "https://heartless87.github.io");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle OPTIONS request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    // -----------------------------------------------------

    // Import inside function (Vercel fix)
    const { MongoClient } = await import("mongodb");

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        const uri = process.env.MONGO_URI;
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db("Product");
        const collection = db.collection("Prodlist");

        const data = req.body;

        // Format images
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
        client.close();

        return res.status(200).json({ success: true, message: "Product saved successfully!" });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

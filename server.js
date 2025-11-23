require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

// Multer Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 7 }
}).array("images", 7);

// MongoDB Client
const client = new MongoClient(process.env.MONGO_URI);

// API Route (Save Product)
app.post("/api/products", (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ success: false, message: "Image upload error" });
        }

        const { title, description, originalPrice, sellingPrice } = req.body;

        // Convert images to Base64
        const imagesBase64 = (req.files || []).map(img =>
            `data:${img.mimetype};base64,${img.buffer.toString("base64")}`
        );

        if (imagesBase64.length === 0) {
            return res.json({ success: false, message: "At least one image required" });
        }

        const product = {
            title,
            description,
            originalPrice,
            sellingPrice,
            images: imagesBase64,
            createdAt: new Date()
        };

        try {
            await client.connect();
            const db = client.db("Product");
            const col = db.collection("Prodlist");

            const result = await col.insertOne(product);

            return res.json({ success: true, id: result.insertedId });
        } catch (error) {
            console.log("DB Error:", error);
            return res.json({ success: false, message: "Database error" });
        }
    });
});

// Start Server
app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});

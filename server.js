require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array("images", 7);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Save to DB
async function saveProductToDB(output) {
    try {
        await client.connect();
        const db = client.db("Product");
        const collection = db.collection("Prodlist");
        const result = await collection.insertOne(output);

        console.log("✔ Data Saved Successfully:", result.insertedId);
        return { success: true, id: result.insertedId };

    } catch (error) {
        console.error("❌ MongoDB Error:", error);
        return { success: false, error: error.message };
    }
}

// API ROUTE: /api/products
app.post("/api/products", (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ message: "Image upload error", error: err });
        }

        const Title = req.body.title;
        const Description = req.body.description;
        const OriginalPrice = req.body.originalPrice;
        const SellingPrice = req.body.sellingPrice;

        let base64Images = (req.files || []).map(img => {
            return `data:${img.mimetype};base64,${img.buffer.toString("base64")}`;
        });

        let output = {
            Title,
            Description,
            "Original-price": OriginalPrice,
            "Sell-price": SellingPrice,
        };

        // Add images dynamically
        base64Images.forEach((img, i) => {
            output[`image-${i + 1}`] = img;
        });

        const saveResult = await saveProductToDB(output);

        res.json({
            message: "Product uploaded & saved successfully",
            mongoResult: saveResult,
            data: output
        });
    });
});

// START SERVER
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});

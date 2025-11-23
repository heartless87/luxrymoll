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

// API ROUTE
app.post("/api/products", (req, res) => {
    upload(req, res, async function (err) {
        if (err) return res.status(400).json({ message: "Image error" });

        const Title = req.body.title;
        const Description = req.body.description;
        const OriginalPrice = req.body.originalPrice;
        const SellingPrice = req.body.sellingPrice;

        let base64Images = (req.files || []).map(img =>
            `data:${img.mimetype};base64,${img.buffer.toString("base64")}`
        );

        let output = {
            Title,
            Description,
            "Original-price": OriginalPrice,
            "Sell-price": SellingPrice,
            images: base64Images
        };

        await client.connect();
        const db = client.db("Product");
        const col = db.collection("Prodlist");

        const result = await col.insertOne(output);

        res.json({ success: true, id: result.insertedId });
    });
});

app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
});

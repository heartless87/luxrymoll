// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const { MongoClient } = require("mongodb");
const app = express();
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array("images", 7);
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
// listeddata.js
// Stores products in localStorage

(function () {
    const STORAGE_KEY = 'luxuryProducts_v1';

    function _receiveProductData(product) {
        try {
            if (!product || !product.Title) {
                console.warn('[listeddata] invalid product', product);
                return false;
            }

            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            existing.push(product);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

            console.log('[listeddata] product saved', product);
            return true;

        } catch (err) {
            console.error('[listeddata] error saving product', err);
            return false;
        }
    }

    function _getProducts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (err) {
            console.error('[listeddata] error reading products', err);
            return [];
        }
    }

    // attach to browser window
    if (typeof window !== "undefined") {
        window.receiveProductData = _receiveProductData;
        window.getProducts = _getProducts;
        console.log("[listeddata] attached to window");
    }
})();

// Save to DB function
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


// ------------------------------
//  API ROUTE
// ------------------------------
app.post("/api/products", (req, res) => {

    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ message: "Image upload error", error: err });
        }

        // Get form fields
        const Title = req.body.title;
        const Description = req.body.description;
        const OriginalPrice = req.body.originalPrice;
        const SellingPrice = req.body.sellingPrice;

        // Convert images to Base64
        let base64Images = (req.files || []).map(img => {
            return `data:${img.mimetype};base64,${img.buffer.toString("base64")}`;
        });

        // Prepare image variables dynamically
        let ImageVariables = {};
        for (let i = 1; i <= 7; i++) {
            ImageVariables[`image-${i}`] = base64Images[i - 1] || "";
        }

        // Prepare final output
        let output = {
            Title,
            Description,
            "Original-price": OriginalPrice,
            "Sell-price": SellingPrice,
        };

        // Add only non-empty image vars
        for (let i = 1; i <= 7; i++) {
            const key = `image-${i}`;
            if (ImageVariables[key] && ImageVariables[key].trim() !== "") {
                output[key] = ImageVariables[key];
            }
        }

        // Save to Mongo
        const saveResult = await saveProductToDB(output);

        return res.json({
            message: "Product uploaded & saved successfully",
            mongoResult: saveResult,
            data: output
        });
    });
});


// ------------------------------
//  START SERVER
// ------------------------------
console.log("[listeddata] file loaded");

window.receiveProductData = function(product) {
    console.log("Product received:", product);

    let stored = JSON.parse(localStorage.getItem("luxuryProducts")) || [];
    stored.push(product);
    localStorage.setItem("luxuryProducts", JSON.stringify(stored));

    console.log("Saved to localStorage");
};

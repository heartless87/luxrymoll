import { MongoClient } from "mongodb";
let cachedClient = null;
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }
  try {
    const uri = process.env.MONGO_URI;
    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }
    const db = cachedClient.db("Product");
    const collection = db.collection("Prodlist");
    const {
      title,
      description,
      originalPrice,
      sellingPrice,
      images,
      sellerEmail
    } = req.body || {};
    if (
      !title ||
      !description ||
      !originalPrice ||
      !sellingPrice ||
      !sellerEmail ||
      !Array.isArray(images) ||
      images.length === 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Login required & valid product data needed"
      });
    }
    const imageObj = {};
    images.slice(0, 7).forEach((img, i) => {
      imageObj[`image-${i + 1}`] = img;
    });

    const newProduct = {
      title: title.trim(),
      description: description.trim(),
      originalPrice: Number(originalPrice),
      sellingPrice: Number(sellingPrice),
      randomKey: Math.random(),
      sellerEmail: sellerEmail.toLowerCase(),

      ...imageObj,
      createdAt: new Date()
    };
    await collection.insertOne(newProduct);
    return res.status(201).json({
      success: true,
      message: "Product added successfully"
    });
  } catch (err) {
    console.error("AddProduct Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

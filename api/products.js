import { MongoClient } from "mongodb";
import multer from "multer";
import nextConnect from "next-connect";

// CORS FIX
export const config = {
    api: {
        bodyParser: false,
    },
};

// Middlewares
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 7 },
});

const handler = nextConnect();

// CORS Middleware
handler.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// MongoDB Connect
let client = null;
async function connectDB() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
    }
    return client.db("Product").collection("Prodlist");
}

// Upload Handler
handler.use(upload.array("images", 7));

// POST → Add Product
handler.post(async (req, res) => {
    try {
        const { title, description, originalPrice, sellingPrice } = req.body;

        const imagesBase64 = (req.files || []).map(img =>
            `data:${img.mimetype};base64,${img.buffer.toString("base64")}`
        );

        const col = await connectDB();

        const product = {
            title,
            description,
            originalPrice,
            sellingPrice,
            images: imagesBase64,
            createdAt: new Date(),
        };

        const result = await col.insertOne(product);
        return res.status(200).json({ success: true, id: result.insertedId });

    } catch (err) {
        console.error("API Error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET → Fetch Products
handler.get(async (req, res) => {
    try {
        const col = await connectDB();
        const products = await col.find().sort({ createdAt: -1 }).toArray();
        return res.status(200).json(products);

    } catch (err) {
        console.error("GET Error:", err);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default handler;

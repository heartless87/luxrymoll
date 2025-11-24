import { MongoClient } from "mongodb";
import multer from "multer";
import nextConnect from "next-connect";

// Multer Setup (for images)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 7 }
});

const handler = nextConnect();

// MongoDB Connection
let client = null;
async function connectDB() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
    }
    return client.db("Product").collection("Prodlist");
}

// ⭐ GET API → Products list
handler.get(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        const col = await connectDB();

        const products = await col.find({})
            .skip(skip)
            .limit(limit)
            .project({
                title: 1,
                images: { $slice: 1 },   // sirf first image bheje
                originalPrice: 1,
                sellingPrice: 1
            })
            .toArray();

        res.status(200).json(products);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ success: false, message: "GET Failed" });
    }
});

// ⭐ POST API → Add new product
handler.use(upload.array("images", 7));

handler.post(async (req, res) => {
    try {
        const { title, description, originalPrice, sellingPrice } = req.body;

        // Convert all images to Base64
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
            createdAt: new Date()
        };

        const result = await col.insertOne(product);

        res.status(200).json({ success: true, id: result.insertedId });

    } catch (err) {
        console.error("POST Error:", err);
        res.status(500).json({ success: false, message: "POST Failed" });
    }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;

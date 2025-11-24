import { MongoClient } from "mongodb";
import multer from "multer";
import nextConnect from "next-connect";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 7 }
});

const handler = nextConnect();

let client = null;
async function connectDB() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
    }
    return client.db("Product").collection("Prodlist");
}

handler.use(upload.array("images", 7));

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
            createdAt: new Date()
        };

        const result = await col.insertOne(product);

        res.status(200).json({ success: true, id: result.insertedId });

    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default handler;

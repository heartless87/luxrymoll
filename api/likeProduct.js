import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

// ---- DB CACHE ----
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "user"
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ---- SCHEMA ----
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    likedProducts: { type: [String], default: [] }
  },
  { collection: "data" }
);

const User =
  mongoose.models.Data || mongoose.model("Data", UserSchema);

// ---- LIKE PRODUCT HANDLER ----
export default async function handler(req, res) {
  const origin = req.headers.origin;

  // 🌍 SAME CORS AS login.js
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false });

  try {
    await connectDB();

    const { email, productId } = req.body || {};

    if (!email || !productId) {
      return res.status(400).json({ success: false });
    }

    // 🔒 SAFE UPDATE (nothing deleted)
    await User.updateOne(
      { email: email.toLowerCase() },
      {
        $addToSet: { likedProducts: productId }
      }
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("LIKE PRODUCT ERROR:", err);
    return res.status(500).json({ success: false });
  }
}

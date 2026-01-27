import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ MongoDB URL from env
const MONGODB_URI = process.env.MONGO_URI;

// ---- DB CACHE ----
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "user", // 🎯 DATABASE NAME
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
  },
  {
    collection: "data", // 🎯 COLLECTION NAME
  }
);

// Model name internal hai, collection fixed rahegi
const User =
  mongoose.models.Data || mongoose.model("Data", UserSchema);

// ---- HANDLER ----
export default async function handler(req, res) {
  const origin = req.headers.origin;

  // ✅ CORS (safe for Vercel + custom domain)
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const cleanEmail = email.toLowerCase();

    // Duplicate check
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully ✅",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error ❌",
    });
  }
}

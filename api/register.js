import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const MONGO_URI = process.env.MONGO_URI;
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: "user",
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    collection: "data",
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// ---------- API HANDLER ----------
export default async function handler(req, res) {

  // 🌍 CORS
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
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

    // 🔎 validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields required ❌"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 🔁 check existing email
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({
        message: "Email already registered ❌"
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 save user
    await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully ✅"
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
}

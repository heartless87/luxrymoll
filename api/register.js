import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// DB cache (Vercel required)
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User =
  mongoose.models.data || mongoose.model("data", UserSchema);

export default async function handler(req, res) {

  // ✅ VERY IMPORTANT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    await User.create({ name, email, password });

    return res.status(201).json({
      message: "Account created successfully ✅"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error ❌"
    });
  }
}

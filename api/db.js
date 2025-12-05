import { MongoClient } from "mongodb";

let client = null;

export async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
  }
  return client.db("user").collection("data");
}

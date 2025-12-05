const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URL);

async function connectDB() {
  if (!client.topology) await client.connect();
  return client.db("user").collection("data");
}

module.exports = connectDB;

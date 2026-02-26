import { MongoClient } from "mongodb";

let cachedClient = null;

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://luxrymoll.shop");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const uri = process.env.MONGO_URI;

    if (!cachedClient) {
      cachedClient = new MongoClient(uri);
      await cachedClient.connect();
    }

    const db = cachedClient.db("user");
    const col = db.collection("data");

    // ---------------- GET ADDRESSES ----------------
    if (req.method === "GET") {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ success: false });
      }

      const user = await col.findOne({ email: email.toLowerCase() });
      return res.status(200).json({
        success: true,
        addresses: user?.addresses ? Object.values(user.addresses) : [],
        favoItem: user?.favoItem ? Object.keys(user.favoItem) : []
      });
    }
    // ===================== POST =====================
    if (req.method === "POST") {

      const { email, address, addressId, action, productId } = req.body;

      if (!email) {
        return res.status(400).json({ success: false });
      }

      const cleanEmail = email.toLowerCase();
      const user = await col.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(404).json({ success: false });
      }
      if (action === "save" && address) {

        const addresses = user.addresses || {};
        const nextIndex = Object.keys(addresses).length + 1;
        const addressKey = `address${nextIndex}`;

        await col.updateOne(
          { email: cleanEmail },
          {
            $set: {
              [`addresses.${addressKey}`]: {
                ...address,
                createdAt: new Date()
              }
            }
          }
        );

        return res.status(200).json({ success: true });
      }
      if (action === "delete" && addressId) {

        const addressKey = Object.keys(user.addresses || {})
          .find(k => user.addresses[k].addressId === addressId);

        if (!addressKey) {
          return res.status(404).json({ success: false });
        }

        await col.updateOne(
          { email: cleanEmail },
          { $unset: { [`addresses.${addressKey}`]: "" } }
        );

        return res.status(200).json({ success: true });
      }
      if (action === "like" && productId) {

        await col.updateOne(
          { email: cleanEmail },
          {
            $set: {
              [`favoItem.${productId}`]: true
            }
          }
        );

        return res.status(200).json({ success: true });
      }
      if (action === "unlike" && productId) {

        await col.updateOne(
          { email: cleanEmail },
          {
            $unset: {
              [`favoItem.${productId}`]: ""
            }
          }
        );

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ success: false });
    }

    return res.status(405).json({ success: false });

  } catch (err) {
    console.error("Address API Error:", err);
    return res.status(500).json({ success: false });
  }
}

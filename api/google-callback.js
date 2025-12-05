import { google } from "googleapis";
import { connectDB } from "./db";

export default async function handler(req, res) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK
    );

    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const users = await connectDB();

    await users.insertOne({
      name: data.name,
      email: data.email,
      provider: "google",
    });

    res.send(`Welcome ${data.name}, Email: ${data.email}`);
  } catch (err) {
    res.status(500).send("Error: " + err.toString());
  }
}

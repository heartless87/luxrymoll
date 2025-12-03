// ================================
//  OTP SYSTEM USING MSG91 (FINAL)
// ================================

const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

// -------------------------------
//  YOUR MSG91 DETAILS
// -------------------------------
const AUTHKEY = "481082AL5WTINiIcr69303121P1";   // Your AuthKey
const TEMPLATE_ID = "693036b13e5d68663a749255";  // Your Template ID

// -------------------------------
//  OTP VARIABLE (STORE HERE)
// -------------------------------
let otpsent = "";       // <-- final OTP stored here
let otpTarget = "";     // <-- number where OTP went

// -------------------------------
//  FUNCTION: SEND OTP VIA MSG91
// -------------------------------
async function sendSMSOTP(phone, otp) {
    try {
        const url =
            `https://api.msg91.com/api/v5/otp?template_id=${TEMPLATE_ID}&mobile=${phone}&otp=${otp}`;

        const response = await axios.post(url, {}, {
            headers: {
                "authkey": AUTHKEY,
                "Content-Type": "application/json"
            }
        });

        console.log("OTP SMS Successfully Sent!");
        return true;

    } catch (error) {
        console.error("SMS Sending Error:", error.response?.data || error);
        return false;
    }
}

// -------------------------------
//  ROUTE: SEND OTP
// -------------------------------
app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.json({ status: "error", message: "Phone number required!" });
    }

    // Generate 6-digit OTP
    otpsent = Math.floor(100000 + Math.random() * 900000).toString();
    otpTarget = phone;

    console.log("OTP Generated:", otpsent);
    console.log("Sending OTP to:", phone);

    const success = await sendSMSOTP(phone, otpsent);

    if (success) {
        res.json({
            status: "success",
            message: "OTP sent successfully!",
            sent_to: phone
        });
    } else {
        res.json({
            status: "error",
            message: "Failed to send OTP"
        });
    }
});

// -------------------------------
//  ROUTE: VERIFY OTP
// -------------------------------
app.post("/verify-otp", (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        return res.json({ status: "error", message: "OTP required!" });
    }

    if (otp === otpsent) {
        return res.json({
            status: "success",
            message: "OTP Verified!"
        });
    } else {
        return res.json({
            status: "error",
            message: "Invalid OTP"
        });
    }
});

// -------------------------------
//  START SERVER
// -------------------------------
app.listen(3000, () => {
    console.log("OTP Server running on port 3000");
});

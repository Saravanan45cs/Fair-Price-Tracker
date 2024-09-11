const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const db = require('../config/db');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;;
const authToken = process.env.TWILIO_AUTH_TOKEN;;
const twilioClient = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS // Use your app password here
  }
});

// Endpoint to get the list of shops
router.get('/shops', async (req, res) => {
  try {
    const [shops] = await db.query('SELECT * FROM Shops');
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to notify shop
router.post('/notify-shop/:shopId', async (req, res) => {
  const shopId = parseInt(req.params.shopId);
  try {
    const [shop] = await db.query('SELECT * FROM Shops WHERE shop_id = ?', [shopId]);

    if (shop.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const shopDetails = shop[0];

    await twilioClient.messages.create({
      body: `Shop ${shopDetails.shop_name} in ${shopDetails.taluk} is closed. Please check the status.`,
      from: '+12565686769',
      to: shopDetails.incharge_number
    });

    await transporter.sendMail({
      from: 'saravanan15cs@gmail.com',
      to: shopDetails.email,
      subject: 'Shop Status Alert',
      text: `Shop ${shopDetails.shop_name} in ${shopDetails.taluk} has been closed.
       Please check the status.`
    });

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error in notify-shop endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to handle calls for closed shops
router.post('/call-shop/:shopId', async (req, res) => {
  const shopId = parseInt(req.params.shopId);
  try {
    const [shop] = await db.query('SELECT * FROM Shops WHERE shop_id = ?', [shopId]);

    if (shop.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const shopDetails = shop[0];

    await twilioClient.calls.create({
      to: shopDetails.incharge_number,
      from: '+12565686769', // Your Twilio number
      url: 'https://handler.twilio.com/twiml/EH0359fd1ad1047d4b8218be61592cc593' // Your TwiML URL
    });

    res.status(200).json({ message: 'Call initiated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

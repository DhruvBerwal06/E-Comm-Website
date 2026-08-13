import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/orderModel.js";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/config", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// 2. Secure Payment Intent Creation using DB Order Total
router.post("/create-payment-intent", protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Fetch the order from DB to get the trusted total
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Convert decimal DB price to cents for Stripe
    const amountInCents = Math.round(order.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order._id.toString() }, // Sent to Stripe for the webhook
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

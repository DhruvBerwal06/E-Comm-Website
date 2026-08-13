import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    // 1. Fetch real products from the database
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id || x.product) },
    });

    if (itemsFromDB.length !== orderItems.length) {
      res.status(404);
      throw new Error("One or more products could not be found");
    }

    // 2. Map client items to real database prices
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (p) =>
          p._id.toString() ===
          (itemFromClient._id || itemFromClient.product).toString(),
      );
      return {
        ...itemFromClient,
        product: itemFromClient._id || itemFromClient.product,
        price: matchingItemFromDB.price, // Trust the DB, not the client
        id: undefined,
      };
    });

    // 3. Recalculate prices server-side
    const itemsPrice = dbOrderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0,
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Example: Free shipping over $100
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // Example: 15% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 4. Minor Bug Fix: Decrement stock tracking
    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";
import dotenv from "dotenv";
import users from "./data/users.js";
import products from "./data/products.js";
import orders from "./data/orders.js";
import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";
import connectDB from "./config/db.js"; // Replace with your MongoDB connection path

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // 1. Insert Users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const customerUser = createdUsers[1]._id;

    // 2. Attach Admin ID to each product
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    const createdProducts = await Product.insertMany(sampleProducts);

    // 3. Attach User ID & Product details to sample order
    const sampleOrders = orders.map((order) => {
      return {
        ...order,
        user: customerUser,
        orderItems: [
          {
            name: createdProducts[0].name,
            qty: 1,
            image: createdProducts[0].image,
            price: createdProducts[0].price,
            product: createdProducts[0]._id,
          },
        ],
      };
    });

    await Order.insertMany(sampleOrders);

    console.log("Data Successfully Seeded!");
    process.exit();
  } catch (error) {
    try {
      console.error(`Seeding Error: ${error.message}`);
      process.exit(1);
    } catch (innerError) {
      console.error("Critical failure during error handling:", innerError);
      process.exit(1);
    }
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Successfully Destroyed!");
    process.exit();
  } catch (error) {
    try {
      console.error(`Destroy Error: ${error.message}`);
      process.exit(1);
    } catch (innerError) {
      console.error("Critical failure during error handling:", innerError);
      process.exit(1);
    }
  }
};

// Command line flag execution: `node seeder -d` to clear data
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}

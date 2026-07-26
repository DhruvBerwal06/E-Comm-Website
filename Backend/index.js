import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

connectDB();

// Middlewares:
app.use(cors()); //middleware for cross-origin requests
app.use(express.json()); //middleware for parsing JSON request bodies
app.use("/api/users", userRoutes); //middleware for user routes
app.use("/api/products", productRoutes); //middleware for product routes
app.use(notFound); //middleware for handling 404 errors
app.use(errorHandler); //middleware for error handling

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

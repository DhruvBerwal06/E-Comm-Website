import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app = express();

connectDB();

// Middlewares:
app.use(cors()); //middleware for cross-origin requests
app.use(express.json()); //middleware for parsing JSON request bodies
app.use("/api/users", userRoutes); //middleware for user routes

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);

router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.route("/:id").delete(protect, admin, deleteUser);

export default router;

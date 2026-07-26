import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // 1. Extract and verify token
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to req inside try block
        req.user = await User.findById(decoded.id).select("-password");
      } catch (error) {
        console.error("JWT verification error:", error.message);
        res.status(401);
        throw new Error("Not authorized, token failed");
      }

      // 2. Check if user actually exists in database
      if (!req.user) {
        res.status(401);
        throw new Error("User no longer exists");
      }

      return next();
    }

    // 3. No token provided
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }
  } catch (error) {
    next(error);
  }
};

export const admin = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
  } catch (error) {
    next(error);
  }
};

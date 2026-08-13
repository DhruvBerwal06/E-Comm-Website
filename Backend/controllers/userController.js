import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "customer",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
      return;
    }

    res.status(400);
    throw new Error("Invalid user data provided");
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
      return;
    }

    res.status(401);
    throw new Error("Invalid email or password");
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    if (req.user) {
      res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      });
      return;
    }

    res.status(404);
    throw new Error("User not found");
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot delete your own admin account");
    }

    if (user.role === "admin") {
      res.status(403);
      throw new Error("Cannot delete another admin user");
    }

    await user.deleteOne();

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // 1. Prevent changing your own role via this endpoint
    if (req.user._id.toString() === user._id.toString() && req.body.role) {
      res.status(400);
      throw new Error("You cannot change your own role");
    }

    // 2. Prevent demoting another admin (if target is already an admin)
    if (user.role === "admin" && req.body.role && req.body.role !== "admin") {
      res.status(403);
      throw new Error("Cannot demote another admin user");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    await user.save();
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

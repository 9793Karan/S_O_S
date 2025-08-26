  import express from "express";
import { registerUser, loginUser ,logoutUser} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

router.post("/logout", logoutUser);

// ✅ Check if user is already logged in
router.get("/check-auth", authMiddleware, (req, res) => {
  res.json({
    isAuthenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      name:req.user.name,
      location: req.user.role === "responder" ? req.user.location : null
    },
  });
});

export default router;

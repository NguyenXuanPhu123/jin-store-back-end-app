import express from "express";
import { jwtMiddleWare } from "../middlewares/authMiddleware.js";

import {
  forgotPassword,
  resetPassword,
  signIn,
  signUp,
  verify,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/verify", verify);

router.use(jwtMiddleWare);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;

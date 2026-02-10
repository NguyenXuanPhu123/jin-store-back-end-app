import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import { connectDB, disconnectDB } from "./database/db.js";
import { jwtMiddleWare } from "./middlewares/authMiddleware.js";
config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/auth", authRoute);

app.use(jwtMiddleWare);
app.use("/product", productRoute);

app.get("/", (req, res) => {
  res.json({ message: "Jin Store API is running..." });
});

process.on("uncaughtException", async (err) => {
  console.error("💥 Uncaught Exception:", err);
  await disconnectDB("uncaughtException");
});

process.on("unhandledRejection", async (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  await disconnectDB("unhandledRejection");
});

const shutdown = async (signal) => {
  console.log(`🚨 App shutting down: ${signal}`);
  await disconnectDB(signal);
};

process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // kill
process.on("SIGQUIT", shutdown);

const PORT = process.env.PORT || 8686;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Jin Store API is running..." });
});

const PORT = process.env.PORT || 8686;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

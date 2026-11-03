require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Lost & Found API berjalan" });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

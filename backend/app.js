require("dotenv").config();
const path = require("path");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const lokerRoutes = require("./routes/lokerRoutes");
const katalogRoutes = require("./routes/katalogRoutes");
const errorHandler = require("./utils/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Lost & Found API berjalan" });
});

app.use("/api/auth", authRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/loker", lokerRoutes);
app.use("/api/katalog", katalogRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

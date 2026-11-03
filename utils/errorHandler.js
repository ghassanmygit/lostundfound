const fs = require("fs");
const multer = require("multer");
const AppError = require("./appError");

const errorHandler = (err, req, res, next) => {
  if (req.file) fs.unlink(req.file.path, () => {});

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Ukuran foto maksimal 2 MB"
        : "Unggah file gagal";
    return res.status(400).json({ success: false, message });
  }
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, errors: err.details });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res
      .status(400)
      .json({ success: false, message: "Pengguna tidak ditemukan" });
  }

  console.error(err);
  return res
    .status(500)
    .json({ success: false, message: "Terjadi kesalahan pada server" });
};

module.exports = errorHandler;

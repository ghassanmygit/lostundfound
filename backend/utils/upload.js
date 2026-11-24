const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { maxImageSizeBytes } = require("./validators");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const randomPart = crypto.randomBytes(4).toString("hex");
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomPart}${extension}`);
  },
});

const createUploader = (fieldName) =>
  multer({ storage, limits: { fileSize: maxImageSizeBytes } }).single(
    fieldName,
  );

const uploadFotoBarang = createUploader("fotoBarang");
const uploadFotoBukti = createUploader("fotoBukti");

module.exports = { uploadFotoBarang, uploadFotoBukti };

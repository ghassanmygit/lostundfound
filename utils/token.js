const jwt = require("jsonwebtoken");

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum diisi di file .env");
  }
  return process.env.JWT_SECRET;
};

const signToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { signToken, verifyToken };

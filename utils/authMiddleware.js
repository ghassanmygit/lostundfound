const AppError = require("./appError");
const { verifyToken } = require("./token");

const requireAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError("Anda harus login terlebih dahulu", 401);
  }

  try {
    const { idPengguna, role } = verifyToken(token);
    req.user = { idPengguna, role };
  } catch {
    throw new AppError("Sesi tidak valid atau sudah berakhir. Silakan login ulang", 401);
  }
  next();
};

const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Anda tidak punya akses ke fitur ini", 403);
    }
    next();
  };

module.exports = { requireAuth, requireRole };

const {
  isFilledString,
  isWithinMaxLength,
  noWaPattern,
} = require("./validators");

const maxNamaLength = 100;
const minPasswordLength = 8;
const maxPasswordLength = 72; // batas aman bcrypt
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getAllowedEmailDomains = () =>
  (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

const isCampusEmail = (email) => {
  const domain = email.trim().toLowerCase().split("@")[1];
  return getAllowedEmailDomains().includes(domain);
};

const validateRegistrasi = (data = {}) => {
  const errors = [];

  if (!isFilledString(data.nama)) {
    errors.push("Nama wajib diisi");
  } else if (!isWithinMaxLength(data.nama, maxNamaLength)) {
    errors.push(`Nama maksimal ${maxNamaLength} karakter`);
  }

  if (!isFilledString(data.email) || !emailPattern.test(data.email.trim())) {
    errors.push("Format email tidak valid");
  } else if (!isCampusEmail(data.email)) {
    errors.push("Gunakan email resmi kampus yang valid");
  }

  if (
    typeof data.password !== "string" ||
    data.password.length < minPasswordLength ||
    data.password.length > maxPasswordLength
  ) {
    errors.push(
      `Kata sandi harus ${minPasswordLength}-${maxPasswordLength} karakter`,
    );
  }

  if (
    data.noWa !== undefined &&
    data.noWa !== "" &&
    (typeof data.noWa !== "string" || !noWaPattern.test(data.noWa.trim()))
  ) {
    errors.push("Nomor WhatsApp harus 8-15 digit (boleh diawali +)");
  }

  return { isValid: errors.length === 0, errors };
};

const validateLogin = (data = {}) => {
  const errors = [];

  if (!isFilledString(data.email)) errors.push("Email wajib diisi");
  if (!isFilledString(data.password)) errors.push("Kata sandi wajib diisi");

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateRegistrasi, validateLogin };

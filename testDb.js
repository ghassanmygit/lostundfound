require("dotenv").config();
const db = require("./utils/db");

db.query("SELECT 1")
  .then(() => {
    console.log("DB terhubung");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

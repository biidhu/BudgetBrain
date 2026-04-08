const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "budgetdb",
  password: "yourpassword",
  port: 5432,
});

module.exports = pool;

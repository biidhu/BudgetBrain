const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { user_id, category_id, limit_amount } = req.body;

  const result = await pool.query(
    "INSERT INTO budgets (user_id, category_id, limit_amount) VALUES ($1,$2,$3) RETURNING *",
    [user_id, category_id, limit_amount]
  );

  res.json(result.rows[0]);
});

module.exports = router;

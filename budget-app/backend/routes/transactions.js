const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/:userId", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE user_id=$1",
    [req.params.userId]
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { user_id, amount, type, category_id } = req.body;

  const result = await pool.query(
    "INSERT INTO transactions (user_id, amount, type, category_id) VALUES ($1,$2,$3,$4) RETURNING *",
    [user_id, amount, type, category_id]
  );

  res.json(result.rows[0]);
});

module.exports = router;

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const budgetRoutes = require("./routes/budget");

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/budget", budgetRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

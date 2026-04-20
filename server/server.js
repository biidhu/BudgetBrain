const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET_KEY = "budgetbrain_secret_key";

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

const db = mysql.createConnection({
  host: "localhost",
  user: "bbuser",
  password: "1234",
  database: "budgetbrain",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed ❌");
    console.log("Error code:", err.code);
    console.log("Error message:", err.message);
  } else {
    console.log("MySQL Connected ✅");
  }
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = decoded;
    next();
  });
}

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend works"
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database check error",
          error: err.message
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, email, password, avatar, theme) VALUES (?, ?, ?, ?, ?)",
        [username, email, hashedPassword, "https://i.pravatar.cc/150?img=12", "dark"],
        (insertErr, insertResult) => {
          if (insertErr) {
            return res.status(500).json({
              success: false,
              message: "Registration failed",
              error: insertErr.message
            });
          }

          return res.json({
            success: true,
            message: "Registered successfully",
            userId: insertResult.insertId
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        created_at: user.created_at
      }
    });
  });
});

app.get("/profile/:id", verifyToken, (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT id, username, email, avatar, theme, created_at FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.json({
        success: true,
        user: result[0]
      });
    }
  );
});

app.put("/settings/:id", verifyToken, (req, res) => {
  const userId = req.params.id;
  const { username, avatar, theme } = req.body;

  if (!username || !avatar || !theme) {
    return res.status(400).json({
      success: false,
      message: "Username, avatar, and theme are required"
    });
  }

  db.query(
    "UPDATE users SET username = ?, avatar = ?, theme = ? WHERE id = ?",
    [username, avatar, theme, userId],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to update settings",
          error: err.message
        });
      }

      return res.json({
        success: true,
        message: "Settings updated successfully"
      });
    }
  );
});

app.get("/dashboard/:id", verifyToken, (req, res) => {
  const userId = req.params.id;

  const totalBalanceQuery = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
      AS totalBalance
    FROM transactions
    WHERE user_id = ?
  `;

  const totalExpensesQuery = `
    SELECT COALESCE(SUM(amount), 0) AS totalExpenses
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
  `;

  const categoryQuery = `
    SELECT category, SUM(amount) AS total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    GROUP BY category
  `;

  db.query(totalBalanceQuery, [userId], (err, balanceResult) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error loading balance",
        error: err.message
      });
    }

    db.query(totalExpensesQuery, [userId], (err2, expenseResult) => {
      if (err2) {
        return res.status(500).json({
          success: false,
          message: "Error loading expenses",
          error: err2.message
        });
      }

      db.query(categoryQuery, [userId], (err3, categoryResult) => {
        if (err3) {
          return res.status(500).json({
            success: false,
            message: "Error loading categories",
            error: err3.message
          });
        }

        return res.json({
          success: true,
          totalBalance: balanceResult[0].totalBalance,
          totalExpenses: expenseResult[0].totalExpenses,
          categories: categoryResult
        });
      });
    });
  });
});

app.get("/transactions", verifyToken, (req, res) => {
  const userId = req.user.id;
  
  db.query(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching transactions",
          error: err.message
        });
      }
      
      return res.json({
        success: true,
        transactions: result
      });
    }
  );
});

app.post("/transactions", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { type, amount, category, description, date } = req.body;
  
  if (!type || !amount || !category || !date) {
    return res.status(400).json({
      success: false,
      message: "Type, amount, category, and date are required"
    });
  }
  
  db.query(
    "INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, type, amount, category, description || null, date],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error creating transaction",
          error: err.message
        });
      }
      
      return res.json({
        success: true,
        message: "Transaction created",
        transactionId: result.insertId
      });
    }
  );
});

app.get("/budgets", verifyToken, (req, res) => {
  const userId = req.user.id;
  
  db.query(
    "SELECT * FROM budgets WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching budgets",
          error: err.message
        });
      }
      
      return res.json({
        success: true,
        budgets: result
      });
    }
  );
});

app.post("/budgets", verifyToken, (req, res) => {
  const userId = req.user.id;
  const { category, amount, month } = req.body;
  
  if (!category || !amount || !month) {
    return res.status(400).json({
      success: false,
      message: "Category, amount, and month are required"
    });
  }
  
  db.query(
    "INSERT INTO budgets (user_id, category, amount, month) VALUES (?, ?, ?, ?)",
    [userId, category, amount, month],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error creating budget",
          error: err.message
        });
      }
      
      return res.json({
        success: true,
        message: "Budget created",
        budgetId: result.insertId
      });
    }
  );
});

app.get("/db-check", (req, res) => {
  db.query("SHOW TABLES", (err, tables) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Could not read tables",
        error: err.message
      });
    }

    return res.json({
      success: true,
      tables
    });
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://127.0.0.1:${PORT} 🚀`);
});
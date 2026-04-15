const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET_KEY = "budgetbrain_secret_key";

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "bbuser",
  password: "1234",
  database: "budgetbrain",
  port: 3307
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

// JWT middleware
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

// Test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend works"
  });
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Register
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

// Login
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

// Get profile
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

// Update settings
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
    (err, result) => {
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

// DB check
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

// Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});
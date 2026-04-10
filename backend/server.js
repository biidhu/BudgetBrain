const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 5000;
const SECRET_KEY = "budgetbrain_secret_key";

console.log("BUDGETBRAIN SERVER FILE LOADED");

app.use(cors());
app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // change if your MySQL has password
  database: "budgetbrain"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err.message);
  } else {
    console.log("MySQL Connected ✅");
  }
});

// JWT verify middleware
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

// Register
app.post("/register", async (req, res) => {
  console.log("===== REGISTER HIT =====");
  console.log("Body:", req.body);

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], async (err, result) => {
      if (err) {
        console.log("CHECK ERROR:", err.message);
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

      const insertSql =
        "INSERT INTO users (username, email, password, avatar, theme) VALUES (?, ?, ?, ?, ?)";

      db.query(
        insertSql,
        [username, email, hashedPassword, "https://i.pravatar.cc/150?img=12", "dark"],
        (err, result) => {
          if (err) {
            console.log("INSERT ERROR:", err.message);
            return res.status(500).json({
              success: false,
              message: "Registration failed",
              error: err.message
            });
          }

          console.log("User inserted successfully:", result.insertId);
          return res.json({
            success: true,
            message: "Registered successfully"
          });
        }
      );
    });
  } catch (error) {
    console.log("SERVER ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Login
app.post("/login", (req, res) => {
  console.log("===== LOGIN HIT =====");
  console.log("Body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("LOGIN DB ERROR:", err.message);
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
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    console.log("Login success:", user.email);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme
      }
    });
  });
});

// Get profile
app.get("/profile", verifyToken, (req, res) => {
  const sql =
    "SELECT id, username, email, avatar, theme, created_at FROM users WHERE id = ?";

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.log("PROFILE DB ERROR:", err.message);
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
  });
});

// Update profile/settings
app.put("/profile", verifyToken, (req, res) => {
  const { username, avatar, theme } = req.body;

  if (!username || !theme) {
    return res.status(400).json({
      success: false,
      message: "Username and theme are required"
    });
  }

  const finalAvatar =
    avatar && avatar.trim() !== ""
      ? avatar
      : "https://i.pravatar.cc/150?img=12";

  const sql =
    "UPDATE users SET username = ?, avatar = ?, theme = ? WHERE id = ?";

  db.query(sql, [username, finalAvatar, theme, req.user.id], (err, result) => {
    if (err) {
      console.log("UPDATE ERROR:", err.message);
      return res.status(500).json({
        success: false,
        message: "Update failed",
        error: err.message
      });
    }

    return res.json({
      success: true,
      message: "Profile updated"
    });
  });
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend works"
  });
});

// DB check route
app.get("/db-check", (req, res) => {
  db.query("SHOW TABLES", (err, tables) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Could not read tables",
        error: err.message
      });
    }

    db.query("DESCRIBE users", (err2, structure) => {
      if (err2) {
        return res.status(500).json({
          success: false,
          message: "users table not found or invalid",
          error: err2.message,
          tables
        });
      }

      return res.json({
        success: true,
        message: "Database is okay",
        tables,
        users_structure: structure
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});
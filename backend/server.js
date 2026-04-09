const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",       // leave blank if no password
    database: "budgetbrain"
});

db.connect((err) => {
    if (err) {
        console.error("DB Connection Failed ❌", err);
    } else {
        console.log("MySQL Connected ✅");
    }
});

// Register route
app.post("/register", (req, res) => {
    const { email, password } = req.body;

    const query = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(query, [email, password], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.json({ success: false, message: "User already exists" });
            } else {
                res.json({ success: false, message: err });
            }
        } else {
            res.json({ success: true });
        }
    });
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            res.json({ success: false, message: err });
        } else if (results.length > 0) {
            res.json({ success: true, token: "fake-jwt-token" });
        } else {
            res.json({ success: false });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000 🚀");
});
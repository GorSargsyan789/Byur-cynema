const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Ավտոմատ ստեղծում է database.sqlite ֆայլը
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to SQLite Database.");
    }
});
db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id TEXT NOT NULL,
        title TEXT NOT NULL,
        poster_path TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
`);
// Ավտոմատ ստեղծում է users աղյուսակը (եթե չկա)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`);
app.post('/api/watchlist/add', (req, res) => {
    const { user_id, movie_id, title, poster_path } = req.body;

    if (!user_id || !movie_id) {
        return res.status(400).json({ message: "user_id-ն և movie_id-ն պարտադիր են" });
    }

    const query = `INSERT INTO watchlist (user_id, movie_id, title, poster_path) VALUES (?, ?, ?, ?)`;
    db.run(query, [user_id, movie_id, title, poster_path], function (err) {
        if (err) {
            return res.status(500).json({ message: "Սխալ ավելացնելիս" });
        }
        res.status(200).json({ message: "Ֆիլմը ավելացվեց Watchlist-ում" });
    });
});
app.get('/api/watchlist/:user_id', (req, res) => {
    const userId = req.params.user_id;

    const query = `SELECT * FROM watchlist WHERE user_id = ?`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Սխալ տվյալները ստանալիս" });
        }
        res.status(200).json(rows); // Ուղարկում է միայն այս user-ի ֆիլմերը
    });
});

// 3. Ջնջել ֆիլմը Watchlist-ից
app.delete('/api/watchlist/remove', (req, res) => {
    const { user_id, movie_id } = req.body;

    const query = `DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?`;
    db.run(query, [user_id, movie_id], function (err) {
        if (err) {
            return res.status(500).json({ message: "Սխալ ջնջելիս" });
        }
        res.status(200).json({ message: "Ֆիլմը հեռացվեց Watchlist-ից" });
    });
});

// Գրանցման (Register) Route
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Լրացրեք բոլոր դաշտերը" });
    }

    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ message: "Այս օգտատերը արդեն գոյություն ունի" });
            }
            return res.status(500).json({ message: "Տվյալների բազայի սխալ" });
        }
        res.status(200).json({ message: "Գրանցումը հաջողվեց" });
    });
});

// Մուտքի (Login) Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Սխալ տվյալների բազայում" });
        }
        if (!user) {
            return res.status(400).json({ message: "Սխալ օգտանուն կամ ծածկագիր" });
        }
        res.status(200).json({ 
            message: "Մուտքը հաջողվեց", 
            token: "fake-jwt-token", 
            username: user.username 
        });
    });
});

app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});

require('dotenv').config();
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

/* CORS nur für externe Zugriffe nötig — Frontend läuft auf gleicher Domain */
app.use(cors({ origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }));
app.use(express.json());

/* ── Database pool ── */
const pool = mysql.createPool({
  host:              process.env.DB_HOST     || 'localhost',
  port:              parseInt(process.env.DB_PORT || '3306'),
  user:              process.env.DB_USER     || 'mysql',
  password:          process.env.DB_PASSWORD || '',
  database:          process.env.DB_NAME     || 'default',
  waitForConnections: true,
  connectionLimit:   10,
  timezone: '+00:00',
});

/* ── Create tables if they don't exist ── */
async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id          VARCHAR(120)  PRIMARY KEY,
      name        VARCHAR(255)  NOT NULL,
      category    VARCHAR(100),
      description TEXT,
      price       VARCHAR(60),
      badge       VARCHAR(60),
      image_url   VARCHAR(600),
      amazon_url  VARCHAR(600),
      visible     TINYINT(1)    NOT NULL DEFAULT 1,
      sort_order  INT           NOT NULL DEFAULT 0,
      created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255) NOT NULL,
      phone      VARCHAR(100),
      subject    VARCHAR(255),
      message    TEXT         NOT NULL,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      customer_name  VARCHAR(255),
      customer_email VARCHAR(255),
      customer_phone VARCHAR(100),
      product_ids    JSON,
      note           TEXT,
      status         VARCHAR(60) NOT NULL DEFAULT 'neu',
      created_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Datenbanktabellen bereit.');
}

/* ── Frontend statisch ausliefern ── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── Routes ── */

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date() }));

/* GET /api/products — liefert sichtbare Produkte; leeres Array = Fallback auf Frontend */
app.get('/api/products', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE visible = 1 ORDER BY sort_order, created_at'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/products', err.message);
    res.status(500).json({ error: 'Datenbankfehler' });
  }
});

/* POST /api/contact — Kontaktformular speichern */
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body ?? {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, E-Mail und Nachricht sind Pflichtfelder.' });
  }
  try {
    await pool.execute(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), phone?.trim() || null, subject?.trim() || null, message.trim()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/contact', err.message);
    res.status(500).json({ error: 'Speichern fehlgeschlagen.' });
  }
});

/* POST /api/orders — Warenkorb-Anfrage speichern */
app.post('/api/orders', async (req, res) => {
  const { name, email, phone, productIds, note } = req.body ?? {};
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'Keine Produkte angegeben.' });
  }
  try {
    await pool.execute(
      `INSERT INTO orders
         (customer_name, customer_email, customer_phone, product_ids, note)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name?.trim()  || null,
        email?.trim() || null,
        phone?.trim() || null,
        JSON.stringify(productIds),
        note?.trim()  || null,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/orders', err.message);
    res.status(500).json({ error: 'Speichern fehlgeschlagen.' });
  }
});

/* Alle anderen Routen → index.html (SPA-Fallback) */
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

/* ── Start ── */
app.listen(PORT, () => console.log(`coolpool-api läuft auf Port ${PORT}`));
initDB().catch(err => console.error('DB-Init fehlgeschlagen (Demo-Modus aktiv):', err.message));

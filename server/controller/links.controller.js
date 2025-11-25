const pool = require('../db/pool');
const { urlValidator } = require('../service/url-validator');
const { generateCode } = require('../utils/generateCode');

// Health check
const healthCheck = (req, res) => {
  res.json({ ok: true, version: "1.0", uptime: process.uptime() });
};

// Create short link
const createLink = async (req, res) => {
  const { url, code } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Await the async validator
  const isValid = await urlValidator(url);
  if (!isValid) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let shortCode = code ? code.trim() : generateCode();

  if (code && !/^[A-Za-z0-9]{6,8}$/.test(shortCode)) {
    return res.status(400).json({ error: "Custom code must be between 6-8 alphanumeric characters" });
  }

  try {
    const codeExists = await pool.query("SELECT 1 FROM links WHERE code = $1", [shortCode]);
    if (codeExists.rowCount > 0) {
      return res.status(409).json({ error: "Short code already taken" });
    }

    const urlExists = await pool.query("SELECT 1 FROM links WHERE url = $1", [url.trim()]);

    if (urlExists.rowCount > 0) {
      return res.status(409).json({ error: "This URL is already shortened" });
    }

    const result = await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *",
      [shortCode, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// List all links
const getAllLinks = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// Get single link stats
const getLink = async (req, res) => {
  const { code } = req.params;

  if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    return res.status(404).send("Not found");
  }

  try {
    const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// Check code validity
const validCode = async (req, res) => {
  const { code } = req.params;

  if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    return res.status(404).send("Not found");
  }

  try {
    const result = await pool.query("SELECT * FROM links WHERE code = $1", [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// Delete link
const deleteLink = async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query("DELETE FROM links WHERE code = $1", [code]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};

// Redirect handler
const redirectLink = async (req, res) => {
  const { code } = req.params;

  if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    return res.status(404).send("Not found");
  }

  try {
    const { rows } = await pool.query(
      `UPDATE links 
       SET clicks = clicks + 1, last_clicked = NOW() 
       WHERE code = $1 
       RETURNING url`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).send("Not found");
    }

    res.redirect(302, rows[0].url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  healthCheck,
  createLink,
  getAllLinks,
  getLink,
  deleteLink,
  redirectLink,
  validCode
};
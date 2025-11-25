const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per windowMs
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,     // Disable old headers
  message: {
    error: "Too many requests from this IP, please try again later."
  },
    keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  }
});

module.exports = {limiter};
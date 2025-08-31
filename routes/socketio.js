// routes/socketio.js

import express from "express";
const router = express.Router();

/**
 * Simple health check for the Socket.IO route
 * This is not where the websocket runs — it's just a REST route
 * so you can verify Nginx proxying works to /socket.io/ path.
 */
router.get("/", (req, res) => {
  res.json({ message: "Socket.IO route is active" });
});

export default router;

const Session = require('../models/Session');

async function createSession(req, res) {
  try {
    const { educator_id, cluster, topic, attendance_count, date } = req.body;
    const session = await Session.create({
      educator_id,
      cluster,
      topic,
      attendance_count: Number(attendance_count) || 0,
      date: date || new Date(),
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getSessions(req, res) {
  try {
    const { educator_id, cluster } = req.query;
    const filter = {};
    if (educator_id) filter.educator_id = educator_id;
    if (cluster) filter.cluster = cluster;

    const sessions = await Session.find(filter).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createSession, getSessions };

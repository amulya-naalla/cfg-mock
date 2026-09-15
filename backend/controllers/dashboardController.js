const Assessment = require('../models/Assessment');

async function getSummary(req, res) {
  const totalAssessments = await Assessment.countDocuments();
  const flaggedCount = await Assessment.countDocuments({ flagged: true });

  const byCluster = await Assessment.aggregate([
    { $group: { _id: '$cluster', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
  ]);

  res.json({ totalAssessments, flaggedCount, byCluster });
}

module.exports = { getSummary };

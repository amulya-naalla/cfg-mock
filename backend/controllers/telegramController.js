const Student = require('../models/Student');

async function linkTelegram(req, res) {
  const { phone, chat_id } = req.body;

  if (!phone || !chat_id) {
    return res.status(400).json({ error: 'phone and chat_id are required' });
  }

  const students = await Student.find({ guardian_contact: phone });

  if (students.length === 0) {
    return res.status(404).json({ error: 'No student found with that guardian phone number' });
  }

  await Student.updateMany({ guardian_contact: phone }, { parent_telegram_chat_id: chat_id });
  const updated = await Student.find({ guardian_contact: phone });

  res.json({
    linked_count: updated.length,
    students: updated.map((s) => ({ _id: s._id, name: s.name })),
  });
}

module.exports = { linkTelegram };

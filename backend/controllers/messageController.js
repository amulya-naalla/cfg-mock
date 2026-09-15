const Message = require('../models/Message');

/**
 * Generate a bilingual 2-way teacher / AI response based on student question & language.
 */
function getTeacherAutoResponse(question, lang = 'en', studentName = 'Aarav') {
  const q = String(question || '').toLowerCase();
  
  if (q.includes('math') || q.includes('addition') || q.includes('fraction') || q.includes('गणित')) {
    if (lang === 'mr') {
      return `नमस्ते ${studentName}! गणिताच्या प्रश्नासाठी सराव संच प्रकरणांमध्ये जा. १/२ आणि १/४ ची चित्रे तपासा. मदत हवी असल्यास मला विचारा! - रोहन सर`;
    } else if (lang === 'hi') {
      return `नमस्ते ${studentName}! गणित के प्रश्नों के लिए अभ्यास अनुभाग देखें। यदि कोई संदेह हो तो मुझे बताएं! - रोहन सर`;
    } else if (lang === 'ta') {
      return `வணக்கம் ${studentName}! கணிதப் பயிற்சி வினாக்களைத் தொடர்ந்து செய்யுங்கள். உதவிகள் தேவைப்பட்டால் கேளுங்கள்! - ரோஹன் ஆசிரியர்`;
    }
    return `Hello ${studentName}! Great math question. Check out the practice modules on fractions and carry-over addition in your library! - Teacher Rohan`;
  }

  if (q.includes('class') || q.includes('session') || q.includes('time') || q.includes('वेळ')) {
    if (lang === 'mr') {
      return `आपला पुढचा सराव वर्ग उद्या दुपारी ४ वाजता आहे. नक्की या! - रोहन सर`;
    } else if (lang === 'ta') {
      return `நமது அடுத்த வகுப்பு நாளை மாலை 4 மணிக்கு நடைபெறும். - ரோஹன் ஆசிரியர்`;
    }
    return `Our next cluster interactive session is scheduled for tomorrow at 4:00 PM! - Teacher Rohan`;
  }

  if (lang === 'mr') {
    return `धन्यवाद ${studentName}! तुमचा संदेश मिळाला आहे. मी लवकरच तुमच्याशी चर्चा करेन. अभ्यास चालू ठेवा! - रोहन सर`;
  } else if (lang === 'ta') {
    return `நன்றி ${studentName}! உங்கள் செய்தி கிடைத்துள்ளது. தொடர்ந்து படியுங்கள்! - ரோஹன் ஆசிரியர்`;
  } else if (lang === 'hi') {
    return `धन्यवाद ${studentName}! आपका संदेश मिल गया है। अभ्यास जारी रखें! - रोहन सर`;
  }

  return `Thank you ${studentName}! I have received your message. Keep practicing your modules! - Teacher Rohan`;
}

exports.getMessages = async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'student_id parameter is required' });
    }
    const messages = await Message.find({ student_id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { student_id, sender, sender_name, text, language } = req.body;
    if (!student_id || !text) {
      return res.status(400).json({ error: 'student_id and text are required' });
    }

    const newMessage = await Message.create({
      student_id,
      sender: sender || 'student',
      sender_name: sender_name || 'Student',
      text,
      language: language || 'en',
      timestamp: new Date(),
    });

    const responseList = [newMessage];

    // If sent by student, generate 2-way teacher response
    if (sender === 'student' || !sender) {
      const replyText = getTeacherAutoResponse(text, language, sender_name);
      const teacherReply = await Message.create({
        student_id,
        sender: 'educator',
        sender_name: 'Rohan Sharma (Teacher)',
        text: replyText,
        language: language || 'en',
        timestamp: new Date(Date.now() + 1000),
      });
      responseList.push(teacherReply);
    }

    res.status(201).json(responseList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

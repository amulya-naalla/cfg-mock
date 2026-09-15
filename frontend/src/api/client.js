import axios from 'axios';

// Expected score lookup table by grade level (§4 Contract)
export const GRADE_BENCHMARKS = {
  '1': 40,
  '2': 45,
  '3': 50,
  '4': 55,
  '5': 60,
  '6': 65,
  '7': 70,
  '8': 75,
};

export const SUBJECTS = ['Math', 'Reading', 'Science', 'English'];

export const EDUCATOR_PROFILE = {
  name: 'Sunita Sharma',
  role: 'Community Field Educator',
  cluster: 'North-2',
};

// Seed fallback data matching backend/seed/seed.js for zero-downtime demos
const INITIAL_FALLBACK_STUDENTS = [
  { _id: 'stu-101', name: 'Aarav Sharma', grade: '5', language: 'hi', cluster: 'North-2', flagged: false },
  { _id: 'stu-102', name: 'Meera Iyer', grade: '6', language: 'ta', cluster: 'North-1', flagged: true },
  { _id: 'stu-103', name: 'Rahul Verma', grade: '5', language: 'en', cluster: 'North-2', flagged: false },
  { _id: 'stu-104', name: 'Priya Jadhav', grade: '3', language: 'mr', cluster: 'South-1', flagged: true },
];

const INITIAL_FALLBACK_ASSESSMENTS = [
  { _id: 'asm-1', student_id: 'stu-101', subject: 'Math', score: 72, cluster: 'fractions', flagged: false, createdAt: '2026-03-10' },
  { _id: 'asm-2', student_id: 'stu-102', subject: 'Reading', score: 45, cluster: 'comprehension', flagged: true, createdAt: '2026-03-12' },
  { _id: 'asm-3', student_id: 'stu-103', subject: 'Math', score: 88, cluster: 'geometry', flagged: false, createdAt: '2026-03-08' },
  { _id: 'asm-4', student_id: 'stu-104', subject: 'Reading', score: 38, cluster: 'phonics', flagged: true, createdAt: '2026-03-14' },
];

const getStoredFallback = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStoredFallback = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(e);
  }
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 4000,
});

// Response interceptor: graceful fallback to local data if backend is not yet running
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only intercept network errors or timeouts to prevent demo interruption
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message.includes('Network Error');
    if (!isNetworkError) {
      return Promise.reject(error);
    }

    const config = error.config;
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    console.warn(`[API Client] Backend unreachable at ${config.baseURL}. Using local demo fallback for ${method.toUpperCase()} ${url}`);

    const students = getStoredFallback('FALLBACK_STUDENTS', INITIAL_FALLBACK_STUDENTS);
    const assessments = getStoredFallback('FALLBACK_ASSESSMENTS', INITIAL_FALLBACK_ASSESSMENTS);

    // GET /api/students
    if (method === 'get' && url.includes('/api/students') && !url.includes('/parent-summary')) {
      // Calculate latest flagged status for each student
      const studentsWithFlags = students.map((s) => {
        const studentAsms = assessments.filter((a) => String(a.student_id) === String(s._id));
        const latest = studentAsms[studentAsms.length - 1];
        return {
          ...s,
          flagged: latest ? Boolean(latest.flagged) : Boolean(s.flagged),
          last_subject: latest?.subject || '-',
          last_score: latest?.score ?? null,
        };
      });
      return Promise.resolve({ data: studentsWithFlags, status: 200 });
    }

    // GET /api/assessments
    if (method === 'get' && url.includes('/api/assessments')) {
      const studentIdParam = url.split('student_id=')[1]?.split('&')[0];
      const filtered = studentIdParam
        ? assessments.filter((a) => String(a.student_id) === String(studentIdParam))
        : assessments;
      return Promise.resolve({ data: filtered, status: 200 });
    }

    // POST /api/assessments
    if (method === 'post' && url.includes('/api/assessments')) {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const score = Number(body.score);
      const newAsm = {
        _id: 'asm-' + Date.now(),
        student_id: body.student_id,
        subject: body.subject,
        score: score,
        cluster: body.cluster || 'general',
        flagged: score < 50, // computeFlag server simulation
        createdAt: new Date().toISOString(),
      };
      assessments.push(newAsm);
      setStoredFallback('FALLBACK_ASSESSMENTS', assessments);
      return Promise.resolve({ data: newAsm, status: 201 });
    }

    // POST /api/students/:id/parent-summary
    if (method === 'post' && url.includes('/parent-summary')) {
      const studentId = url.split('/api/students/')[1]?.split('/parent-summary')[0];
      const student = students.find((s) => String(s._id) === String(studentId)) || { name: 'Student', grade: '5', language: 'hi' };
      const studentAsms = assessments.filter((a) => String(a.student_id) === String(studentId));
      const latest = studentAsms[studentAsms.length - 1] || { subject: 'Learning', score: 45, flagged: true };
      
      const lang = student.language || 'hi';
      let summaryText = '';
      if (lang === 'mr') {
        summaryText = `नमस्कार! ${student.name} चा वर्ग ${student.grade} मधील '${latest.subject}' चा सराव पूर्ण झाला. मिळवलेले गुण: ${latest.score}/100. ${latest.flagged ? '⚠️ थोडे अधिक सरावाची गरज आहे.' : '🎉 प्रगती छान आहे!'}`;
      } else if (lang === 'hi') {
        summaryText = `नमस्ते! ${student.name} (कक्षा ${student.grade}) का '${latest.subject}' मूल्यांकन पूर्ण हुआ। प्राप्त अंक: ${latest.score}/100। ${latest.flagged ? '⚠️ घर पर 15 मिनट अभ्यास अवश्य कराएं।' : '🎉 बहुत अच्छा प्रदर्शन!'}`;
      } else {
        summaryText = `Hello! ${student.name} (Grade ${student.grade}) completed the '${latest.subject}' assessment. Score: ${latest.score}/100. ${latest.flagged ? '⚠️ Needs extra practice on core concepts.' : '🎉 Excellent progress!'}`;
      }

      return Promise.resolve({
        data: {
          student_id: studentId,
          summary: summaryText,
        },
        status: 200,
      });
    }

    return Promise.reject(error);
  }
);

export default client;

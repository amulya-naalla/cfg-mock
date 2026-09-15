/**
 * Seed data and local storage manager for cfg-mock frontend
 * Ensures graceful fallback when MongoDB Atlas or backend is not connected.
 */

export const INITIAL_STUDENTS = [
  {
    _id: 'stu-101',
    id: 'stu-101',
    name: 'Aarav Patil',
    grade: '3',
    cluster: 'North-2',
    district: 'Pune Rural',
    language: 'mr',
    flagged: true,
    last_assessment_date: '2026-03-10',
    last_subject: 'Math',
    last_score: 28,
  },
  {
    _id: 'stu-102',
    id: 'stu-102',
    name: 'Priya Sharma',
    grade: '2',
    cluster: 'North-2',
    district: 'Pune Rural',
    language: 'hi',
    flagged: false,
    last_assessment_date: '2026-03-12',
    last_subject: 'Reading',
    last_score: 58,
  },
  {
    _id: 'stu-103',
    id: 'stu-103',
    name: 'Rohan Deshmukh',
    grade: '4',
    cluster: 'North-1',
    district: 'Pune Rural',
    language: 'mr',
    flagged: true,
    last_assessment_date: '2026-03-14',
    last_subject: 'Reading',
    last_score: 32,
  },
  {
    _id: 'stu-104',
    id: 'stu-104',
    name: 'Ananya Iyer',
    grade: '3',
    cluster: 'North-2',
    district: 'Pune Rural',
    language: 'en',
    flagged: false,
    last_assessment_date: '2026-03-08',
    last_subject: 'Science',
    last_score: 64,
  },
  {
    _id: 'stu-105',
    id: 'stu-105',
    name: 'Vikram Jadhav',
    grade: '1',
    cluster: 'South-1',
    district: 'Pune Rural',
    language: 'mr',
    flagged: true,
    last_assessment_date: '2026-03-11',
    last_subject: 'Math',
    last_score: 22,
  },
  {
    _id: 'stu-106',
    id: 'stu-106',
    name: 'Meera Iyer',
    grade: '6',
    cluster: 'East-1',
    district: 'Pune Rural',
    language: 'ta',
    flagged: true,
    last_assessment_date: '2026-03-13',
    last_subject: 'Reading',
    last_score: 45,
  },
  {
    _id: 'stu-107',
    id: 'stu-107',
    name: 'Rahul Verma',
    grade: '5',
    cluster: 'North-2',
    district: 'Pune Rural',
    language: 'en',
    flagged: false,
    last_assessment_date: '2026-03-09',
    last_subject: 'Math',
    last_score: 88,
  }
];

export const INITIAL_ASSESSMENTS = [
  {
    _id: 'asm-1001',
    student_id: 'stu-101',
    subject: 'Reading',
    score: 52,
    cluster: 'North-2',
    flagged: false,
    createdAt: '2026-01-15'
  },
  {
    _id: 'asm-1002',
    student_id: 'stu-101',
    subject: 'Math',
    score: 28,
    cluster: 'North-2',
    flagged: true,
    createdAt: '2026-03-10'
  },
  {
    _id: 'asm-1003',
    student_id: 'stu-102',
    subject: 'Reading',
    score: 58,
    cluster: 'North-2',
    flagged: false,
    createdAt: '2026-03-12'
  },
  {
    _id: 'asm-1004',
    student_id: 'stu-103',
    subject: 'Reading',
    score: 32,
    cluster: 'North-1',
    flagged: true,
    createdAt: '2026-03-14'
  },
  {
    _id: 'asm-1005',
    student_id: 'stu-104',
    subject: 'Science',
    score: 64,
    cluster: 'North-2',
    flagged: false,
    createdAt: '2026-03-08'
  },
  {
    _id: 'asm-1006',
    student_id: 'stu-105',
    subject: 'Math',
    score: 22,
    cluster: 'South-1',
    flagged: true,
    createdAt: '2026-03-11'
  },
  {
    _id: 'asm-1007',
    student_id: 'stu-106',
    subject: 'Reading',
    score: 45,
    cluster: 'East-1',
    flagged: true,
    createdAt: '2026-03-13'
  },
  {
    _id: 'asm-1008',
    student_id: 'stu-107',
    subject: 'Math',
    score: 88,
    cluster: 'North-2',
    flagged: false,
    createdAt: '2026-03-09'
  }
];

const STUDENTS_KEY = 'CFG_FALLBACK_STUDENTS_V2';
const ASSESSMENTS_KEY = 'CFG_FALLBACK_ASSESSMENTS_V2';

export const LocalStore = {
  getStudents() {
    try {
      const data = localStorage.getItem(STUDENTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    this.saveStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  },

  saveStudents(students) {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  },

  getAssessments(studentId) {
    try {
      const data = localStorage.getItem(ASSESSMENTS_KEY);
      const list = data ? JSON.parse(data) : INITIAL_ASSESSMENTS;
      if (!data) this.saveAssessments(INITIAL_ASSESSMENTS);
      return studentId ? list.filter((a) => String(a.student_id) === String(studentId)) : list;
    } catch (e) {
      return INITIAL_ASSESSMENTS;
    }
  },

  saveAssessments(assessments) {
    try {
      localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments));
    } catch (e) {
      console.error(e);
    }
  },

  addAssessment({ student_id, subject, score, cluster, grade_level_expected }) {
    const list = this.getAssessments();
    const isFlagged = Number(score) < (Number(grade_level_expected) || 50);

    const newRecord = {
      _id: 'asm-' + Date.now(),
      student_id: String(student_id),
      subject: String(subject),
      score: Number(score),
      cluster: cluster || 'North-2',
      flagged: isFlagged,
      createdAt: new Date().toISOString()
    };

    list.push(newRecord);
    this.saveAssessments(list);

    // Update student flagged status
    const students = this.getStudents();
    const s = students.find((st) => String(st._id || st.id) === String(student_id));
    if (s) {
      s.flagged = isFlagged;
      s.last_score = Number(score);
      s.last_subject = subject;
      s.last_assessment_date = newRecord.createdAt.split('T')[0];
      this.saveStudents(students);
    }

    return newRecord;
  }
};

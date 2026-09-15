/**
 * Unified API Client for cfg-mock
 * 
 * Implements endpoints per §4 of the Architecture & Contract:
 * - GET /api/students
 * - GET /api/assessments?student_id=:id
 * - POST /api/assessments
 * - POST /api/students/:id/parent-summary
 * 
 * Directly interfaces with Person B's backend and gracefully falls back to LocalStore
 * when the backend or MongoDB is offline.
 */

import client from './client.js';
import { CONFIG, GRADE_BENCHMARKS } from '../config.js';
import { LocalStore } from '../seed-data.js';

export const api = {
  /**
   * Quick check if Person B's backend is responding
   */
  async checkHealth() {
    try {
      const res = await client.get('/api/students', { timeout: 2500 });
      return res.status === 200;
    } catch {
      return false;
    }
  },

  /**
   * 1. GET /api/students
   */
  async getStudents() {
    try {
      const res = await client.get('/api/students');
      const data = Array.isArray(res.data) ? res.data : (res.data?.students || []);
      return data;
    } catch (err) {
      console.warn('API getStudents failed, using fallback seed data:', err.message);
      return LocalStore.getStudents();
    }
  },

  /**
   * 2. GET /api/students/:id
   */
  async getStudentById(id) {
    try {
      const students = await this.getStudents();
      const student = students.find((s) => String(s._id || s.id) === String(id));
      return student || null;
    } catch {
      const fallbackList = LocalStore.getStudents();
      return fallbackList.find((s) => String(s._id || s.id) === String(id)) || null;
    }
  },

  /**
   * 3. GET /api/assessments?student_id=:id
   */
  async getAssessments(studentId) {
    try {
      const res = await client.get(`/api/assessments?student_id=${studentId}`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.warn('API getAssessments failed, using fallback:', err.message);
      return LocalStore.getAssessments(studentId);
    }
  },

  /**
   * 4. POST /api/assessments
   * 
   * Server-side flagged calculation per §4 contract:
   * "flagged is computed server-side by Person B's route — you don't compute it,
   * just send score and threshold and trust the response."
   */
  async createAssessment({ student_id, subject, score, cluster, grade_level_expected }) {
    const payload = {
      student_id: String(student_id),
      subject: String(subject),
      score: Number(score),
      cluster: cluster || 'North-2',
      grade_level_expected: Number(grade_level_expected) || 45
    };

    try {
      const res = await client.post('/api/assessments', payload);
      // Sync local fallback store
      LocalStore.addAssessment({
        ...res.data,
        student_id,
        subject,
        score,
        cluster,
        grade_level_expected
      });
      return res.data;
    } catch (err) {
      console.warn('API POST assessment failed, saving to local store:', err.message);
      return LocalStore.addAssessment(payload);
    }
  },

  /**
   * 5. POST /api/students/:id/parent-summary (Person C handoff)
   */
  async getParentSummary(student) {
    const id = student._id || student.id;
    try {
      const res = await client.post(`/api/students/${id}/parent-summary`);
      return res.data.summary;
    } catch (err) {
      // Localized fallback
      const lang = (student.language || 'hi').toLowerCase();
      if (lang === 'mr') {
        return `नमस्कार! ${student.name} चा वर्ग ${student.grade} मधील सराव पूर्ण झाला. ${student.flagged ? '⚠️ काही संकल्पनांवर अधिक सरावाची गरज आहे. कृपया घरी दररोज १५ मिनिटे अभ्यास करून घ्यावा.' : '🎉 विद्यार्थ्याची प्रगती उत्तम आहे!'}`;
      } else if (lang === 'hi') {
        return `नमस्ते! ${student.name} (कक्षा ${student.grade}) का मूल्यांकन पूरा हुआ। ${student.flagged ? '⚠️ इस विषय में अतिरिक्त अभ्यास की आवश्यकता है। कृपया प्रतिदिन 15-20 मिनट अभ्यास अवश्य कराएं।' : '🎉 विद्यार्थी का प्रदर्शन बहुत सराहनीय है!'}`;
      } else {
        return `Hello! ${student.name} (Grade ${student.grade}) completed the learning assessment. ${student.flagged ? '⚠️ Extra one-on-one attention recommended for core concepts.' : '🎉 Meeting all grade-level benchmarks successfully!'}`;
      }
    }
  }
};

export default api;

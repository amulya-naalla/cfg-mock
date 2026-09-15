import { useEffect, useState } from 'react';
import client from '../api/client.js';
import StudentCard from '../components/StudentCard.jsx';

export default function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    client.get('/api/students').then((res) => setStudents(res.data));
  }, []);

  return (
    <div>
      <h1>Students</h1>
      <div className="student-list">
        {students.map((student) => (
          <StudentCard key={student._id} student={student} />
        ))}
      </div>
    </div>
  );
}

/**
 * Central mock data store for the Educator Dashboard & Content pages.
 * Mirrors the shapes the real backend (Person B / C) will return, and
 * persists user changes to localStorage so the demo state sticks.
 */

export const SKILL_AREAS = [
  { key: 'reading', label: 'Reading' },
  { key: 'math', label: 'Mathematics' },
  { key: 'verbal', label: 'Verbal Fluency' },
  { key: 'cognitive', label: 'Cognitive Ability' },
  { key: 'written', label: 'Written Communication' },
];

export const SKILL_LABELS = SKILL_AREAS.reduce((acc, s) => {
  acc[s.key] = s.label;
  return acc;
}, {});

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'kn', label: 'Kannada' },
];

export const LANG_LABELS = LANGUAGES.reduce((acc, l) => {
  acc[l.code] = l.label;
  return acc;
}, {});

export const SUBJECTS = ['Math', 'Reading', 'Science', 'English'];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const CONTENT_TYPES = [
  'Explanation',
  'Practice Questions',
  'Activity',
  'Story',
  'Video',
  'Worksheet',
];

export const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8'];

// ---------------------------------------------------------------------------
// Students: age + grade + learning level + primary learning gap + language
// ---------------------------------------------------------------------------

export const INITIAL_STUDENTS = [
  {
    _id: 'stu-101',
    name: 'Aarav Patil',
    age: 9,
    grade: '3',
    language: 'mr',
    cluster: 'North-2',
    flagged: false,
    last_assessment_date: '2026-03-10',
    last_subject: 'Math',
    last_score: 42,
    learning_level: 'below',
    primary_gap: 'math',
  },
  {
    _id: 'stu-102',
    name: 'Priya Sharma',
    age: 8,
    grade: '2',
    language: 'hi',
    cluster: 'North-2',
    flagged: false,
    last_assessment_date: '2026-03-12',
    last_subject: 'Reading',
    last_score: 58,
    learning_level: 'on-track',
    primary_gap: 'reading',
  },
  {
    _id: 'stu-103',
    name: 'Rohan Deshmukh',
    age: 10,
    grade: '4',
    language: 'mr',
    cluster: 'North-1',
    flagged: true,
    last_assessment_date: '2026-03-14',
    last_subject: 'Reading',
    last_score: 32,
    learning_level: 'below',
    primary_gap: 'reading',
  },
  {
    _id: 'stu-104',
    name: 'Ananya Iyer',
    age: 9,
    grade: '3',
    language: 'en',
    cluster: 'North-2',
    flagged: false,
    last_assessment_date: '2026-03-08',
    last_subject: 'Science',
    last_score: 64,
    learning_level: 'ahead',
    primary_gap: null,
  },
  {
    _id: 'stu-105',
    name: 'Vikram Jadhav',
    age: 7,
    grade: '1',
    language: 'mr',
    cluster: 'South-1',
    flagged: true,
    last_assessment_date: '2026-03-11',
    last_subject: 'Math',
    last_score: 22,
    learning_level: 'below',
    primary_gap: 'math',
  },
  {
    _id: 'stu-106',
    name: 'Meera Iyer',
    age: 12,
    grade: '6',
    language: 'ta',
    cluster: 'East-1',
    flagged: true,
    last_assessment_date: '2026-03-13',
    last_subject: 'Reading',
    last_score: 45,
    learning_level: 'below',
    primary_gap: 'reading',
  },
  {
    _id: 'stu-107',
    name: 'Rahul Verma',
    age: 11,
    grade: '5',
    language: 'en',
    cluster: 'North-2',
    flagged: false,
    last_assessment_date: '2026-03-09',
    last_subject: 'Math',
    last_score: 88,
    learning_level: 'ahead',
    primary_gap: null,
  },
  {
    _id: 'stu-108',
    name: 'Kavya Nair',
    age: 13,
    grade: '7',
    language: 'ta',
    cluster: 'East-1',
    flagged: true,
    last_assessment_date: '2026-03-15',
    last_subject: 'Reading',
    last_score: 35,
    learning_level: 'below',
    primary_gap: 'reading',
  },
  {
    _id: 'stu-109',
    name: 'Imran Shaikh',
    age: 12,
    grade: '7',
    language: 'hi',
    cluster: 'North-2',
    flagged: true,
    last_assessment_date: '2026-03-14',
    last_subject: 'Math',
    last_score: 40,
    learning_level: 'below',
    primary_gap: 'math',
  },
  {
    _id: 'stu-110',
    name: 'Sneha Gaikwad',
    age: 10,
    grade: '4',
    language: 'mr',
    cluster: 'North-1',
    flagged: false,
    last_assessment_date: '2026-03-13',
    last_subject: 'English',
    last_score: 55,
    learning_level: 'on-track',
    primary_gap: 'written',
  },
  {
    _id: 'stu-111',
    name: 'Deepak Kumar',
    age: 11,
    grade: '5',
    language: 'hi',
    cluster: 'South-1',
    flagged: false,
    last_assessment_date: '2026-03-10',
    last_subject: 'Reading',
    last_score: 60,
    learning_level: 'on-track',
    primary_gap: 'verbal',
  },
  {
    _id: 'stu-112',
    name: 'Tanvi More',
    age: 14,
    grade: '8',
    language: 'mr',
    cluster: 'North-2',
    flagged: false,
    last_assessment_date: '2026-03-15',
    last_subject: 'Math',
    last_score: 70,
    learning_level: 'on-track',
    primary_gap: 'cognitive',
  },
];

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export const INITIAL_ASSESSMENTS = [
  { _id: 'asm-1001', student_id: 'stu-101', subject: 'Reading', score: 52, cluster: 'North-2', flagged: false, createdAt: '2026-01-15' },
  { _id: 'asm-1002', student_id: 'stu-101', subject: 'Math', score: 42, cluster: 'North-2', flagged: true, createdAt: '2026-03-10' },
  { _id: 'asm-1003', student_id: 'stu-102', subject: 'Reading', score: 58, cluster: 'North-2', flagged: false, createdAt: '2026-03-12' },
  { _id: 'asm-1004', student_id: 'stu-103', subject: 'Reading', score: 32, cluster: 'North-1', flagged: true, createdAt: '2026-03-14' },
  { _id: 'asm-1005', student_id: 'stu-104', subject: 'Science', score: 64, cluster: 'North-2', flagged: false, createdAt: '2026-03-08' },
  { _id: 'asm-1006', student_id: 'stu-105', subject: 'Math', score: 22, cluster: 'South-1', flagged: true, createdAt: '2026-03-11' },
  { _id: 'asm-1007', student_id: 'stu-106', subject: 'Reading', score: 45, cluster: 'East-1', flagged: true, createdAt: '2026-03-13' },
  { _id: 'asm-1008', student_id: 'stu-107', subject: 'Math', score: 88, cluster: 'North-2', flagged: false, createdAt: '2026-03-09' },
  { _id: 'asm-1009', student_id: 'stu-108', subject: 'Reading', score: 35, cluster: 'East-1', flagged: true, createdAt: '2026-03-15' },
  { _id: 'asm-1010', student_id: 'stu-109', subject: 'Math', score: 40, cluster: 'North-2', flagged: true, createdAt: '2026-03-14' },
  { _id: 'asm-1011', student_id: 'stu-110', subject: 'English', score: 55, cluster: 'North-1', flagged: false, createdAt: '2026-03-13' },
  { _id: 'asm-1012', student_id: 'stu-111', subject: 'Reading', score: 60, cluster: 'South-1', flagged: false, createdAt: '2026-03-10' },
  { _id: 'asm-1013', student_id: 'stu-112', subject: 'Math', score: 70, cluster: 'North-2', flagged: false, createdAt: '2026-03-15' },
];

// ---------------------------------------------------------------------------
// Interventions (active / completed)
// ---------------------------------------------------------------------------

export const INITIAL_INTERVENTIONS = [
  {
    _id: 'int-1',
    student_id: 'stu-103',
    type: '1-on-1 Reading Session',
    notes: 'Daily 20-min phonics & fluency practice',
    started: '2026-03-08',
    status: 'active',
  },
  {
    _id: 'int-2',
    student_id: 'stu-106',
    type: 'Peer Learning Pair',
    paired_with: 'Kavya Nair',
    notes: 'Paired with Kavya for shared reading practice',
    started: '2026-03-10',
    status: 'active',
  },
  {
    _id: 'int-3',
    student_id: 'stu-108',
    type: '1-on-1 Reading Session',
    notes: 'Beginner Tamil comprehension workbook assigned',
    started: '2026-03-12',
    status: 'active',
  },
  {
    _id: 'int-4',
    student_id: 'stu-109',
    type: 'Math Remedial Block',
    notes: 'Place value & regrouping remediation, 3x/week',
    started: '2026-03-09',
    status: 'active',
  },
  {
    _id: 'int-5',
    student_id: 'stu-105',
    type: 'Math Remedial Block',
    notes: 'Number bonds & counting practice with manipulatives',
    started: '2026-02-20',
    status: 'completed',
  },
  {
    _id: 'int-6',
    student_id: 'stu-102',
    type: 'Math Remedial Block',
    notes: 'Two-digit addition practice completed successfully',
    started: '2026-01-15',
    completed: '2026-03-05',
    status: 'completed',
  },
];

// ---------------------------------------------------------------------------
// Tasks (Today's tasks; checked state persists locally)
// ---------------------------------------------------------------------------

export const INITIAL_TASKS = [
  { _id: 'task-1', label: 'Review Aarav Patil progress', done: false },
  { _id: 'task-2', label: 'Assign learning content to Rohan Deshmukh', done: false },
  { _id: 'task-3', label: 'Follow up on intervention for Meera Iyer', done: false },
  { _id: 'task-4', label: 'Complete pending work: assessment for Imran Shaikh', done: false },
  { _id: 'task-5', label: 'Review Meera Iyer progress', done: false },
  { _id: 'task-6', label: 'Assign learning content to Kavya Nair', done: false },
  { _id: 'task-7', label: 'Follow up on intervention for Rohan Deshmukh', done: false },
  { _id: 'task-8', label: 'Complete pending work: assessment for Vikram Jadhav', done: false },
];

// ---------------------------------------------------------------------------
// Content catalog: age/grade + language + difficulty + skill
// ---------------------------------------------------------------------------

export const INITIAL_CONTENT = [
  {
    _id: 'cnt-001',
    title: 'Reading Comprehension – Beginner',
    subject: 'Reading',
    type: 'Explanation',
    age_min: 10,
    age_max: 12,
    grades: ['5', '6'],
    language: 'ta',
    difficulty: 'Beginner',
    skill: 'reading',
    level: 'beginner',
    description:
      'Short Tamil passages with picture-based questions to build core comprehension skills step by step.',
    body: `Read the short passage and answer the questions.\n\nPassage: Meena wakes up early every morning. She helps her mother water the plants before school. After school, she reads a storybook for twenty minutes.\n\n1. What does Meena do every morning?\n2. How long does Meena read?\n3. What kind of child is Meena?`,
  },
  {
    _id: 'cnt-002',
    title: 'Addition & Subtraction Practice Pack',
    subject: 'Math',
    type: 'Practice Questions',
    age_min: 7,
    age_max: 9,
    grades: ['2', '3'],
    language: 'mr',
    difficulty: 'Beginner',
    skill: 'math',
    level: 'beginner',
    description:
      'Marathi worksheets moving from number bonds to two-digit carry-over problems with worked examples.',
    body: `Solve the following.\n\n1) 12 + 7 = __\n2) 25 + 14 = __\n3) 30 − 8 = __\n4) 47 − 19 = __\n5) A shopkeeper had 34 mangoes and sold 16. How many are left?`,
  },
  {
    _id: 'cnt-003',
    title: 'Story Sequencing Cards',
    subject: 'Reading',
    type: 'Activity',
    age_min: 6,
    age_max: 8,
    grades: ['1', '2'],
    language: 'hi',
    difficulty: 'Beginner',
    skill: 'reading',
    level: 'beginner',
    description:
      'Cut-out picture cards students arrange in order, then narrate the story in their own words.',
    body: `Print and cut the 4 picture cards. Ask the student to:\n\n1. Arrange the cards from first to last.\n2. Tell the story aloud in their own words.\n3. Give the story a title.`,
  },
  {
    _id: 'cnt-004',
    title: 'Speaking Circles: Daily Objects',
    subject: 'English',
    type: 'Activity',
    age_min: 9,
    age_max: 12,
    grades: ['4', '5', '6'],
    language: 'en',
    difficulty: 'Beginner',
    skill: 'verbal',
    level: 'beginner',
    description:
      'Circle-time prompts where each student describes a daily object to build spoken fluency and confidence.',
    body: `Sit in a circle. Pass an object around.\n\n1. Name the object.\n2. Say one thing you do with it.\n3. Say one thing it is NOT used for.\n4. Listen and repeat one sentence a classmate said.`,
  },
  {
    _id: 'cnt-005',
    title: 'Fractions Made Visible',
    subject: 'Math',
    type: 'Video',
    age_min: 10,
    age_max: 13,
    grades: ['5', '6', '7'],
    language: 'hi',
    difficulty: 'Intermediate',
    skill: 'math',
    level: 'intermediate',
    description:
      'Visual explainer using folded paper and rotis to introduce halves, thirds and quarters before numerals.',
    body: `Video walkthrough (6 min):\n\n1. Fold a paper into 2 equal parts — each is one half.\n2. Fold again — four quarters.\n3. Compare 1/2 of a roti vs 1/4 of the same roti. Which is bigger?\n4. Practice: shade 1/2, 1/3 and 3/4 on worksheet squares.`,
  },
  {
    _id: 'cnt-006',
    title: 'Pattern Puzzles & Logic Ladders',
    subject: 'Math',
    type: 'Worksheet',
    age_min: 11,
    age_max: 14,
    grades: ['6', '7', '8'],
    language: 'en',
    difficulty: 'Advanced',
    skill: 'cognitive',
    level: 'advanced',
    description:
      'Number and shape patterns that stretch reasoning: find the rule, continue the sequence, justify the answer.',
    body: `Find the rule and continue each pattern:\n\n1) 2, 4, 8, 16, __\n2) 1, 4, 9, 16, __\n3) 3, 8, 5, 10, 7, 12, __\n4) Draw the next figure in the dot-pattern series and explain your rule aloud.`,
  },
  {
    _id: 'cnt-007',
    title: 'Paragraph Writing Starter',
    subject: 'English',
    type: 'Worksheet',
    age_min: 10,
    age_max: 13,
    grades: ['5', '6', '7'],
    language: 'en',
    difficulty: 'Intermediate',
    skill: 'written',
    level: 'intermediate',
    description:
      'Guided frames that take students from a topic sentence to a full 5-sentence paragraph with a checklist.',
    body: `Use the frames to write one paragraph on "My Village":\n\n1. Topic sentence: My village is ____.\n2. Add one thing you can see there.\n3. Add one thing you like about it.\n4. Add one thing you would change.\n5. Ending sentence: ____.`,
  },
  {
    _id: 'cnt-008',
    title: 'Phonics Foundations: Letter Sounds',
    subject: 'Reading',
    type: 'Explanation',
    age_min: 5,
    age_max: 7,
    grades: ['1', '2'],
    language: 'mr',
    difficulty: 'Beginner',
    skill: 'reading',
    level: 'beginner',
    description:
      'Marathi letter-sound drills with mouth-shape cues for first-generation learners starting from zero.',
    body: `For each letter:\n\n1. Say the sound (not the letter name) — hold it for 2 seconds.\n2. Show the mouth shape in a mirror.\n3. Find 3 objects in the room that start with this sound.\n4. Trace the letter in air, then on paper.`,
  },
  {
    _id: 'cnt-009',
    title: 'Memory Games: Spot the Change',
    subject: 'Math',
    type: 'Activity',
    age_min: 8,
    age_max: 11,
    grades: ['3', '4', '5'],
    language: 'hi',
    difficulty: 'Intermediate',
    skill: 'cognitive',
    level: 'intermediate',
    description:
      'Working-memory circle games (recall sequences, spot the removed object) that underpin math fluency.',
    body: `Game 1 — Kim's game: place 8 objects, students close eyes, remove one. "What is missing?"\n\nGame 2 — Sequence echo: clap a rhythm, students repeat it, then extend by one clap.\n\nGame 3 — Number chain: each student repeats the chain and adds one number: 3 → 3,7 → 3,7,1 …`,
  },
  {
    _id: 'cnt-010',
    title: 'Writing Sentences with Pictures',
    subject: 'English',
    type: 'Worksheet',
    age_min: 8,
    age_max: 10,
    grades: ['3', '4'],
    language: 'mr',
    difficulty: 'Beginner',
    skill: 'written',
    level: 'beginner',
    description:
      'Picture prompts with who/what/where scaffolds so students write complete sentences before paragraphs.',
    body: `Look at each picture. Answer:\n\n1. Who is in the picture?\n2. What are they doing?\n3. Where is it happening?\n\nNow write it all as ONE sentence: ____ ____ ____.`,
  },
  {
    _id: 'cnt-011',
    title: 'Tamil Vocabulary Builders',
    subject: 'Reading',
    type: 'Practice Questions',
    age_min: 10,
    age_max: 13,
    grades: ['5', '6', '7'],
    language: 'ta',
    difficulty: 'Intermediate',
    skill: 'reading',
    level: 'intermediate',
    description:
      'Word-family and match-the-meaning drills in Tamil for students reading below grade level.',
    body: `Match the word to its meaning, then use each word in your own sentence:\n\n1. நீர் (water) — ____\n2. பள்ளி (school) — ____\n3. நண்பன் (friend) — ____\n4. ஓடு (run) — ____`,
  },
  {
    _id: 'cnt-012',
    title: 'Storytelling with Puppets',
    subject: 'English',
    type: 'Activity',
    age_min: 6,
    age_max: 9,
    grades: ['1', '2', '3'],
    language: 'hi',
    difficulty: 'Beginner',
    skill: 'verbal',
    level: 'beginner',
    description:
      'Sock-puppet retelling of folk tales to develop sentence formation and expressive speech.',
    body: `1. Tell a short folk tale with two puppets.\n2. Students take one puppet each and retell the tale.\n3. Ask: what happens next? Let them invent a new ending.\n4. Praise full sentences, not correct grammar.`,
  },
  {
    _id: 'cnt-013',
    title: 'Multiplication Tables Ladder',
    subject: 'Math',
    type: 'Practice Questions',
    age_min: 9,
    age_max: 12,
    grades: ['4', '5', '6'],
    language: 'en',
    difficulty: 'Intermediate',
    skill: 'math',
    level: 'intermediate',
    description:
      'Skip-counting ladders and rapid-recall drills from ×2 to ×10, with weekly progress tracking.',
    body: `Ladder 1: count in 2s to 20, then fill: 2, 4, __, 8, __\nLadder 2: count in 5s to 50, then fill: 5, 10, __, 20, __\nLadder 3: rapid recall — 45 seconds per table, beat your own score.`,
  },
  {
    _id: 'cnt-014',
    title: 'Hindi Reading Fluency Ladder',
    subject: 'Reading',
    type: 'Explanation',
    age_min: 9,
    age_max: 12,
    grades: ['4', '5', '6'],
    language: 'hi',
    difficulty: 'Intermediate',
    skill: 'reading',
    level: 'intermediate',
    description:
      'Paired repeated-reading routine in Hindi: same passage, four reads, tracking words per minute.',
    body: `Paired fluency routine:\n\n1. Teacher models reading the passage aloud.\n2. Student reads the same passage aloud — mark words per minute.\n3. Student re-reads 2 more times silently then aloud.\n4. Compare: did wpm improve? Celebrate the gain, not perfection.`,
  },
  {
    _id: 'cnt-015',
    title: 'Number Sense with Beads & Stones',
    subject: 'Math',
    type: 'Activity',
    age_min: 5,
    age_max: 8,
    grades: ['1', '2'],
    language: 'ta',
    difficulty: 'Beginner',
    skill: 'math',
    level: 'beginner',
    description:
      'Hands-on counting, grouping and comparing with beads/stones before any written numerals.',
    body: `1. Count out 10 beads. Group them into 2s. How many groups?\n2. Make two piles: 7 stones and 4 stones. Which has more? By how much?\n3. Hide some beads under a cup: "5 beads, 2 hidden — how many under the cup?"`,
  },
  {
    _id: 'cnt-016',
    title: 'Letter Writing to a Friend',
    subject: 'English',
    type: 'Activity',
    age_min: 12,
    age_max: 14,
    grades: ['7', '8'],
    language: 'en',
    difficulty: 'Intermediate',
    skill: 'written',
    level: 'intermediate',
    description:
      'Real-purpose writing: students draft letters about their week using a greeting/body/closing template.',
    body: `Write a letter to a friend about your week:\n\n1. Greeting: Dear ____\n2. Body: two things you did, one thing you learned.\n3. Closing: Your friend, ____\n4. Exchange letters with a partner and write back.`,
  },
  {
    _id: 'cnt-017',
    title: 'Shape Hunt Around Us',
    subject: 'Math',
    type: 'Activity',
    age_min: 6,
    age_max: 8,
    grades: ['1', '2'],
    language: 'mr',
    difficulty: 'Beginner',
    skill: 'math',
    level: 'beginner',
    description:
      'Students find and name circles, triangles and rectangles in their surroundings, then draw and count them.',
    body: `1. Find 3 things shaped like a circle, 2 like a triangle, 2 like a rectangle.\n2. Draw each one and write its name.\n3. Count the sides of each shape aloud.`,
  },
  {
    _id: 'cnt-018',
    title: 'Comprehension: Read & Retell',
    subject: 'Reading',
    type: 'Practice Questions',
    age_min: 12,
    age_max: 14,
    grades: ['7', '8'],
    language: 'en',
    difficulty: 'Advanced',
    skill: 'reading',
    level: 'advanced',
    description:
      'Grade-level passages with inference questions: predict, justify, and summarize in three sentences.',
    body: `Read the passage, then:\n\n1. Retell the story in 3 sentences.\n2. Why do you think the character did that? (Use "because".)\n3. Predict what happens next and give one reason.\n4. Underline two words you learned and use each in a new sentence.`,
  },
];

// ---------------------------------------------------------------------------
// Assignments log (which content is assigned to which student)
// ---------------------------------------------------------------------------

export const INITIAL_ASSIGNMENTS = [
  { _id: 'asg-1', content_id: 'cnt-001', student_id: 'stu-106', assigned_on: '2026-03-12' },
  { _id: 'asg-2', content_id: 'cnt-002', student_id: 'stu-101', assigned_on: '2026-03-11' },
  { _id: 'asg-3', content_id: 'cnt-008', student_id: 'stu-103', assigned_on: '2026-03-09' },
  { _id: 'asg-4', content_id: 'cnt-005', student_id: 'stu-109', assigned_on: '2026-03-10' },
];

// ---------------------------------------------------------------------------
// LocalStore — localStorage-backed store mirroring backend responses so the
// demo works with zero backend. All mutations persist and broadcast updates.
// ---------------------------------------------------------------------------

const KEYS = {
  students: 'CFG_STUDENTS_V3',
  assessments: 'CFG_ASSESSMENTS_V3',
  content: 'CFG_CONTENT_V3',
  tasks: 'CFG_TASKS_V3',
  interventions: 'CFG_INTERVENTIONS_V3',
  assignments: 'CFG_ASSIGNMENTS_V3',
};

const clone = (x) => JSON.parse(JSON.stringify(x));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStore load failed', e);
  }
  return clone(fallback);
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStore save failed', e);
  }
}

let listeners = [];

function emit() {
  listeners.forEach((fn) => fn());
}

export const LocalStore = {
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  // ----- Students -----
  getStudents() {
    return load(KEYS.students, INITIAL_STUDENTS);
  },

  addStudent({ name, age, grade, language, cluster, primary_gap }) {
    const students = this.getStudents();
    const student = {
      _id: 'stu-' + Date.now(),
      name,
      age: Number(age) || null,
      grade: String(grade || '1'),
      language: language || 'en',
      cluster: cluster || 'North-2',
      flagged: false,
      last_assessment_date: null,
      last_subject: null,
      last_score: null,
      learning_level: 'on-track',
      primary_gap: primary_gap || null,
    };
    students.push(student);
    save(KEYS.students, students);
    emit();
    return student;
  },

  // ----- Assessments -----
  getAssessments() {
    return load(KEYS.assessments, INITIAL_ASSESSMENTS);
  },

  // ----- Content -----
  getContent() {
    return load(KEYS.content, INITIAL_CONTENT);
  },

  addContent(data) {
    const content = this.getContent();
    const difficulty = data.difficulty || 'Beginner';
    const item = {
      _id: 'cnt-' + Date.now(),
      title: data.title,
      subject: data.subject || 'Reading',
      type: data.type || 'Explanation',
      age_min: Number(data.age_min) || 6,
      age_max: Number(data.age_max) || 12,
      grades: Array.isArray(data.grades) ? data.grades : [String(data.grade || '5')],
      language: data.language || 'en',
      difficulty,
      skill: data.skill || 'reading',
      level: difficulty.toLowerCase(),
      description: data.description || '',
      body: data.body || '',
      created_by: 'educator',
      created_at: new Date().toISOString(),
    };
    content.unshift(item);
    save(KEYS.content, content);
    emit();
    return item;
  },

  // ----- Tasks -----
  getTasks() {
    return load(KEYS.tasks, INITIAL_TASKS);
  },

  toggleTask(id) {
    const tasks = this.getTasks();
    const t = tasks.find((x) => x._id === id);
    if (t) {
      t.done = !t.done;
      save(KEYS.tasks, tasks);
      emit();
    }
    return t;
  },

  // ----- Interventions -----
  getInterventions() {
    return load(KEYS.interventions, INITIAL_INTERVENTIONS);
  },

  addIntervention({ student_id, type, notes }) {
    const list = this.getInterventions();
    const item = {
      _id: 'int-' + Date.now(),
      student_id: String(student_id),
      type,
      notes: notes || '',
      started: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    list.push(item);
    save(KEYS.interventions, list);
    emit();
    return item;
  },

  // ----- Assignments -----
  getAssignments() {
    return load(KEYS.assignments, INITIAL_ASSIGNMENTS);
  },

  addAssignment({ content_id, student_id }) {
    const list = this.getAssignments();
    const item = {
      _id: 'asg-' + Date.now(),
      content_id: String(content_id),
      student_id: String(student_id),
      assigned_on: new Date().toISOString().split('T')[0],
    };
    list.push(item);
    save(KEYS.assignments, list);
    emit();
    return item;
  },

  // ----- Reset -----
  resetAll() {
    Object.values(KEYS).forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(e);
      }
    });
    emit();
  },
};

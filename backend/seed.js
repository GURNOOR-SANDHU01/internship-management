const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const RecruiterProfile = require('./models/RecruiterProfile');
const StudentProfile = require('./models/StudentProfile');
const Internship = require('./models/Internship');
const Hackathon = require('./models/Hackathon');
const Application = require('./models/Application');
const MentorAssignment = require('./models/MentorAssignment');
const Task = require('./models/Task');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await RecruiterProfile.deleteMany();
    await StudentProfile.deleteMany();
    await Internship.deleteMany();
    await Hackathon.deleteMany();
    await Application.deleteMany();
    await MentorAssignment.deleteMany();
    await Task.deleteMany();

    console.log('Data Cleared!');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@xebea.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Create Recruiter
    const recruiterUser = await User.create({
      name: 'Jane Recruiter',
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      role: 'recruiter'
    });

    await RecruiterProfile.create({
      user: recruiterUser._id,
      companyName: 'TechCorp',
      industry: 'Software Development',
      website: 'https://techcorp.com',
      description: 'A leading tech company building enterprise solutions',
      location: 'San Francisco, CA'
    });

    // Create Mentor
    const mentorUser = await User.create({
      name: 'Dr. Sarah Mentor',
      email: 'mentor@techcorp.com',
      password: hashedPassword,
      role: 'mentor'
    });

    // Create 3 Students
    const student1 = await User.create({
      name: 'Alice Smith',
      email: 'alice@university.edu',
      password: hashedPassword,
      role: 'student'
    });

    const student2 = await User.create({
      name: 'Bob Jones',
      email: 'bob@university.edu',
      password: hashedPassword,
      role: 'student'
    });

    const student3 = await User.create({
      name: 'Charlie Davis',
      email: 'charlie@university.edu',
      password: hashedPassword,
      role: 'student'
    });

    // Student Profiles
    await StudentProfile.create({
      user: student1._id,
      phone: '+1 555-0101',
      skills: ['React', 'CSS', 'JavaScript', 'TypeScript'],
      education: [{ institution: 'MIT', degree: 'BS Computer Science', year: '2026' }],
      projects: [{ title: 'Portfolio Site', description: 'Personal portfolio built with React', link: 'https://github.com/alice/portfolio' }],
      github: 'https://github.com/alicesmith',
      linkedin: 'https://linkedin.com/in/alicesmith',
    });

    await StudentProfile.create({
      user: student2._id,
      phone: '+1 555-0102',
      skills: ['Node.js', 'Express', 'MongoDB', 'Python'],
      education: [{ institution: 'Stanford', degree: 'BS Software Engineering', year: '2026' }],
      github: 'https://github.com/bobjones',
      linkedin: 'https://linkedin.com/in/bobjones',
    });

    await StudentProfile.create({
      user: student3._id,
      phone: '+1 555-0103',
      skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow'],
      education: [{ institution: 'UC Berkeley', degree: 'BS Data Science', year: '2027' }],
      github: 'https://github.com/charliedavis',
    });

    // Create 5 Internships
    const internships = await Internship.insertMany([
      {
        recruiter: recruiterUser._id,
        title: 'Frontend Developer Intern',
        companyName: 'Google',
        description: 'Work on cutting-edge frontend technologies.',
        requirements: ['React', 'CSS', 'JavaScript'],
        stipend: '$5000/mo',
        location: 'Mountain View, CA',
        type: 'On-site'
      },
      {
        recruiter: recruiterUser._id,
        title: 'Backend Engineering Intern',
        companyName: 'Amazon',
        description: 'Scale robust backend systems.',
        requirements: ['Node.js', 'AWS', 'MongoDB'],
        stipend: '$4800/mo',
        location: 'Seattle, WA',
        type: 'Hybrid'
      },
      {
        recruiter: recruiterUser._id,
        title: 'Data Science Intern',
        companyName: 'Meta',
        description: 'Analyze large datasets to drive product decisions.',
        requirements: ['Python', 'SQL', 'Machine Learning'],
        stipend: '$5500/mo',
        location: 'Menlo Park, CA',
        type: 'On-site'
      },
      {
        recruiter: recruiterUser._id,
        title: 'UI/UX Design Intern',
        companyName: 'Apple',
        description: 'Design intuitive user experiences.',
        requirements: ['Figma', 'Prototyping', 'User Research'],
        stipend: '$4500/mo',
        location: 'Cupertino, CA',
        type: 'On-site'
      },
      {
        recruiter: recruiterUser._id,
        title: 'Software Engineer Intern',
        companyName: 'Microsoft',
        description: 'Develop software for millions of users.',
        requirements: ['C#', '.NET', 'Azure'],
        stipend: '$5200/mo',
        location: 'Redmond, WA',
        type: 'Remote'
      }
    ]);

    // Create Applications (students applying to internships)
    await Application.insertMany([
      { student: student1._id, internship: internships[0]._id, status: 'Shortlisted' },
      { student: student1._id, internship: internships[1]._id, status: 'Applied' },
      { student: student2._id, internship: internships[0]._id, status: 'Interview' },
      { student: student2._id, internship: internships[2]._id, status: 'Applied' },
      { student: student3._id, internship: internships[2]._id, status: 'Hired' },
      { student: student3._id, internship: internships[4]._id, status: 'Applied' },
    ]);

    // Mentor Assignments
    const assignment1 = await MentorAssignment.create({
      mentor: mentorUser._id,
      intern: student1._id,
      project: 'Frontend Redesign',
      progress: 75,
      attendance: '98%',
    });

    const assignment2 = await MentorAssignment.create({
      mentor: mentorUser._id,
      intern: student2._id,
      project: 'API Integration',
      progress: 40,
      attendance: '85%',
    });

    const assignment3 = await MentorAssignment.create({
      mentor: mentorUser._id,
      intern: student3._id,
      project: 'Database Migration',
      progress: 90,
      attendance: '100%',
    });

    // Tasks
    await Task.insertMany([
      {
        mentor: mentorUser._id,
        intern: student1._id,
        title: 'Review PR #42 - Header Component',
        description: 'Review and provide feedback on the new header component pull request.',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        mentor: mentorUser._id,
        intern: student2._id,
        title: 'Complete REST API Endpoints',
        description: 'Finish implementing the remaining CRUD endpoints for the user module.',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        mentor: mentorUser._id,
        intern: student3._id,
        title: 'Schema Migration Script',
        description: 'Write and test the migration script for the new database schema.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        mentor: mentorUser._id,
        intern: student1._id,
        title: 'Write Unit Tests',
        description: 'Add unit tests for the authentication module.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Create 5 Hackathons
    await Hackathon.insertMany([
      {
        title: 'Global AI Hackathon 2026',
        description: 'Build the future of AI over 48 hours.',
        organizer: 'OpenAI',
        date: new Date('2026-08-15'),
        registrationLink: 'https://example.com/ai-hackathon',
        tags: ['AI', 'Machine Learning']
      },
      {
        title: 'Web3 Innovators Sprint',
        description: 'Create decentralized applications.',
        organizer: 'Ethereum Foundation',
        date: new Date('2026-09-01'),
        registrationLink: 'https://example.com/web3-sprint',
        tags: ['Web3', 'Blockchain']
      },
      {
        title: 'Sustainable Tech Challenge',
        description: 'Use technology to solve environmental issues.',
        organizer: 'GreenEarth',
        date: new Date('2026-10-10'),
        registrationLink: 'https://example.com/sustainable-tech',
        tags: ['Sustainability', 'IoT']
      },
      {
        title: 'FinTech Revolution',
        description: 'Innovate the financial sector.',
        organizer: 'Stripe',
        date: new Date('2026-11-05'),
        registrationLink: 'https://example.com/fintech-revolution',
        tags: ['FinTech', 'Finance']
      },
      {
        title: 'HealthTech Hack',
        description: 'Build solutions for modern healthcare.',
        organizer: 'Mayo Clinic',
        date: new Date('2026-12-12'),
        registrationLink: 'https://example.com/healthtech',
        tags: ['Health', 'MedTech']
      }
    ]);

    console.log('Data Imported!');
    console.log('---');
    console.log('Login Credentials (all use password: password123):');
    console.log(`  Admin:     admin@xebea.com`);
    console.log(`  Recruiter: recruiter@techcorp.com`);
    console.log(`  Mentor:    mentor@techcorp.com`);
    console.log(`  Student:   alice@university.edu / bob@university.edu / charlie@university.edu`);
    console.log('---');
    process.exit();
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

seedData();

/**
 * FAZA 4.2 - Training Controller (DB-based)
 * 
 * Migrated from in-memory to database storage.
 */

const trainingService = require('../services/training.service');

// One-time migration on module load
let migrationDone = false;
async function ensureMigration() {
  if (!migrationDone) {
    try {
      await trainingService.migrateCoursesToDB();
      migrationDone = true;
    } catch (error) {
      console.error('Training migration error:', error);
    }
  }
}
ensureMigration();

// GET /api/training/courses
async function getCourses(req, res, next) {
  try {
    await ensureMigration();
    const employeeId = req.query.employee_id;
    const courses = await trainingService.getCourses(employeeId, req);
    res.json(Array.isArray(courses) ? courses : []);
  } catch (error) {
    console.error('Error in getCourses:', error);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
}

// GET /api/training/courses/:id
async function getCourseById(req, res, next) {
  try {
    await ensureMigration();
    const courseId = parseInt(req.params.id);
    const employeeId = req.query.employee_id;
    const course = await trainingService.getCourseById(courseId, employeeId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get progress for modules
    if (employeeId) {
      const progress = await trainingService.getEmployeeProgress(employeeId);
      const moduleProgress = {};
      progress.forEach(p => {
        if (p.course_id === courseId && p.module_id) {
          moduleProgress[p.module_id] = p.status === 'completed';
        }
      });
      
      course.modules = course.modules.map(module => ({
        ...module,
        completed: !!moduleProgress[module.id],
        quiz: module.quiz ? {
          passingScore: module.quiz.passingScore,
          questionsCount: module.quiz.questions.length,
          // Don't send correct answers
          questions: module.quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
          })),
        } : null,
      }));
    }
    
    res.json(course);
  } catch (error) {
    next(error);
  }
}

// GET /api/training/courses/:courseId/modules/:moduleId
async function getModuleById(req, res, next) {
  try {
    await ensureMigration();
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    
    const course = await trainingService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    // For quiz, don't send correct answers
    if (module.type === 'quiz' && module.quiz) {
      const quizForStudent = {
        passingScore: module.quiz.passingScore,
        questions: module.quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
        })),
      };
      
      return res.json({
        ...module,
        quiz: quizForStudent,
      });
    }
    
    res.json(module);
  } catch (error) {
    next(error);
  }
}

// POST /api/training/courses/:courseId/modules/:moduleId/complete
async function completeModule(req, res, next) {
  try {
    await ensureMigration();
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    const { employee_id } = req.body;
    
    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }
    
    const result = await trainingService.completeModule(employee_id, courseId, moduleId);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

// POST /api/training/courses/:courseId/modules/:moduleId/quiz
async function submitQuiz(req, res, next) {
  try {
    await ensureMigration();
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    const { employee_id, answers } = req.body;
    
    if (!employee_id || !answers) {
      return res.status(400).json({ error: 'employee_id and answers are required' });
    }
    
    const result = await trainingService.submitQuiz(employee_id, courseId, moduleId, answers);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

// GET /api/training/progress/:employeeId
async function getEmployeeProgress(req, res, next) {
  try {
    await ensureMigration();
    const employeeId = req.params.employeeId;
    const progress = await trainingService.getEmployeeProgress(employeeId);
    res.json(progress);
  } catch (error) {
    next(error);
  }
}

// GET /api/training/certifications/:employeeId
async function getEmployeeCertifications(req, res, next) {
  try {
    await ensureMigration();
    const employeeId = req.params.employeeId;
    const certs = await trainingService.getEmployeeCertifications(employeeId);
    res.json(Array.isArray(certs) ? certs : []);
  } catch (error) {
    console.error('Error in getEmployeeCertifications:', error);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
}

// GET /api/training/team-progress
async function getTeamProgress(req, res, next) {
  try {
    await ensureMigration();
    const teamProgress = await trainingService.getTeamProgress(req);
    res.json(Array.isArray(teamProgress) ? teamProgress : []);
  } catch (error) {
    console.error('Error in getTeamProgress:', error);
    // Returnează array gol în loc de 500 pentru a preveni crash-ul paginii
    res.json([]);
  }
}

module.exports = {
    getCourses,
    getCourseById,
    getModuleById,
    completeModule,
    submitQuiz,
    getEmployeeProgress,
    getEmployeeCertifications,
    getTeamProgress,
};


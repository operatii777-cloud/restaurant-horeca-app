/**
 * ENTERPRISE CONTROLLER
 * Phase: E8 - Logic migrated from routes/training.js
 * 
 * NOTE: Training module uses in-memory storage (will be migrated to DB in future)
 */

// In-memory storage (from original)
let courses = require('../../../routes/training').courses || [];
let employeeProgress = require('../../../routes/training').employeeProgress || {};
let certifications = require('../../../routes/training').certifications || [];

// GET /api/training/courses
async function getCourses(req, res, next) {
  try {
    const employeeId = req.query.employee_id;
    
    const coursesWithProgress = courses.map(course => {
      let progress = null;
      if (employeeId && employeeProgress[employeeId]) {
        progress = employeeProgress[employeeId][course.id] || null;
      }
      
      const totalModules = course.modules.length;
      const completedModules = progress?.completedModules?.length || 0;
      
      let isLocked = false;
      if (course.requiresCourse) {
        const requiredCourse = courses.find(c => c.id === course.requiresCourse);
        if (requiredCourse && employeeId) {
          const requiredProgress = employeeProgress[employeeId]?.[course.requiresCourse];
          isLocked = !requiredProgress?.completed;
        } else {
          isLocked = true;
        }
      }
      
      return {
        id: course.id,
        title: course.title,
        category: course.category,
        description: course.description,
        duration: course.duration,
        mandatory: course.mandatory,
        icon: course.icon,
        order: course.order,
        totalModules,
        completedModules,
        progress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0,
        status: progress?.completed ? 'completed' : 
                completedModules > 0 ? 'in_progress' : 
                isLocked ? 'locked' : 'not_started',
        isLocked,
        requiresCourse: course.requiresCourse
      };
    });
    
    res.json(coursesWithProgress);
  } catch (error) {
    next(error);
  }
}

// GET /api/training/courses/:id
async function getCourseById(req, res, next) {
  try {
    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const employeeId = req.query.employee_id;
    let moduleProgress = {};
    
    if (employeeId && employeeProgress[employeeId]?.[courseId]) {
      const progress = employeeProgress[employeeId][courseId];
      progress.completedModules?.forEach(moduleId => {
        moduleProgress[moduleId] = true;
      });
    }
    
    const modulesWithProgress = course.modules.map(module => ({
      ...module,
      completed: !!moduleProgress[module.id],
      quiz: module.quiz ? {
        passingScore: module.quiz.passingScore,
        questionsCount: module.quiz.questions.length
      } : null
    }));
    
    res.json({
      ...course,
      modules: modulesWithProgress
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/training/courses/:courseId/modules/:moduleId
async function getModuleById(req, res, next) {
  try {
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    if (module.type === 'quiz' && module.quiz) {
      const quizForStudent = {
        passingScore: module.quiz.passingScore,
        questions: module.quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options
        }))
      };
      
      return res.json({
        ...module,
        quiz: quizForStudent
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
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    const { employee_id } = req.body;
    
    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }
    
    if (!employeeProgress[employee_id]) {
      employeeProgress[employee_id] = {};
    }
    if (!employeeProgress[employee_id][courseId]) {
      employeeProgress[employee_id][courseId] = {
        completedModules: [],
        quizScores: {},
        completed: false,
        startedAt: new Date().toISOString()
      };
    }
    
    if (!employeeProgress[employee_id][courseId].completedModules.includes(moduleId)) {
      employeeProgress[employee_id][courseId].completedModules.push(moduleId);
    }
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const allModulesCompleted = course.modules.every(m => 
        employeeProgress[employee_id][courseId].completedModules.includes(m.id)
      );
      
      if (allModulesCompleted) {
        employeeProgress[employee_id][courseId].completed = true;
        employeeProgress[employee_id][courseId].completedAt = new Date().toISOString();
        
        if (course.mandatory) {
          const existingCert = certifications.find(c => 
            c.employeeId === employee_id && c.courseId === courseId
          );
          
          if (!existingCert) {
            certifications.push({
              id: Date.now().toString(),
              employeeId: employee_id,
              courseId,
              courseTitle: course.title,
              courseIcon: course.icon,
              earnedAt: new Date().toISOString(),
              expiresAt: null
            });
          }
        }
      }
    }
    
    res.json({ 
      success: true, 
      progress: employeeProgress[employee_id][courseId]
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/training/courses/:courseId/modules/:moduleId/quiz
async function submitQuiz(req, res, next) {
  try {
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    const { employee_id, answers } = req.body;
    
    if (!employee_id || !answers) {
      return res.status(400).json({ error: 'employee_id and answers are required' });
    }
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const module = course.modules.find(m => m.id === moduleId);
    if (!module || !module.quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    let correct = 0;
    module.quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correct++;
      }
    });
    
    const score = Math.round((correct / module.quiz.questions.length) * 100);
    const passed = score >= module.quiz.passingScore;
    
    if (!employeeProgress[employee_id]) {
      employeeProgress[employee_id] = {};
    }
    if (!employeeProgress[employee_id][courseId]) {
      employeeProgress[employee_id][courseId] = {
        completedModules: [],
        quizScores: {},
        completed: false,
        startedAt: new Date().toISOString()
      };
    }
    
    employeeProgress[employee_id][courseId].quizScores[moduleId] = {
      score,
      passed,
      submittedAt: new Date().toISOString()
    };
    
    if (passed) {
      if (!employeeProgress[employee_id][courseId].completedModules.includes(moduleId)) {
        employeeProgress[employee_id][courseId].completedModules.push(moduleId);
      }
    }
    
    res.json({
      success: true,
      score,
      passed,
      correct,
      total: module.quiz.questions.length
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/training/progress/:employeeId
async function getEmployeeProgress(req, res, next) {
  try {
    const employeeId = req.params.employeeId;
    const progress = employeeProgress[employeeId] || {};
    
    res.json(progress);
  } catch (error) {
    next(error);
  }
}

// GET /api/training/certifications/:employeeId
async function getEmployeeCertifications(req, res, next) {
  try {
    const employeeId = req.params.employeeId;
    const employeeCerts = certifications.filter(c => c.employeeId === employeeId);
    
    res.json(employeeCerts);
  } catch (error) {
    next(error);
  }
}

// GET /api/training/team-progress
async function getTeamProgress(req, res, next) {
  try {
    const teamProgress = Object.keys(employeeProgress).map(employeeId => {
      const employeeCourses = employeeProgress[employeeId];
      const totalCourses = courses.length;
      const completedCourses = Object.values(employeeCourses).filter(p => p.completed).length;
      
      return {
        employeeId,
        totalCourses,
        completedCourses,
        progress: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
      };
    });
    
    res.json(teamProgress);
  } catch (error) {
    next(error);
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


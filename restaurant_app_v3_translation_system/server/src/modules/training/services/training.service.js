/**
 * FAZA 4.2 - Training Service (DB-based)
 * 
 * Migrates training data from in-memory to database.
 */

const { dbPromise, locationQuery } = require('../../../../database');

/**
 * Migrate courses from in-memory to DB (one-time migration)
 */
async function migrateCoursesToDB() {
  const db = await dbPromise;
  const courses = require('../../../../routes/training').courses || [];
  
  for (const course of courses) {
    // Check if course already exists
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM training_courses WHERE id = ?', [course.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!existing) {
      // Insert course
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO training_courses 
           (id, title, category, description, duration, mandatory, icon, order_index, requires_course_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            course.id,
            course.title,
            course.category,
            course.description,
            course.duration,
            course.mandatory ? 1 : 0,
            course.icon,
            course.order,
            course.requiresCourse || null,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Insert modules
      for (const module of course.modules || []) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO training_modules 
             (id, course_id, title, type, content, duration, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              module.id,
              course.id,
              module.title,
              module.type,
              module.content || null,
              module.duration,
              module.order,
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        // Insert quiz if exists
        if (module.type === 'quiz' && module.quiz) {
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO training_quizzes 
               (module_id, passing_score, questions)
               VALUES (?, ?, ?)`,
              [
                module.id,
                module.quiz.passingScore,
                JSON.stringify(module.quiz.questions),
              ],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
    }
  }
  
  console.log('✅ Training courses migrated to DB');
}

/**
 * Get all courses with progress for employee
 */
async function getCourses(employeeId = null, req = null) {
  const db = await dbPromise;
  
  const courses = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM training_courses WHERE is_active = 1 ORDER BY order_index`,
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  // Get modules for each course
  for (const course of courses) {
    const modules = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM training_modules WHERE course_id = ? ORDER BY order_index`,
        [course.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    course.modules = modules;
    
    // Get progress if employeeId provided
    if (employeeId) {
      const progress = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM training_progress 
           WHERE employee_id = ? AND course_id = ?`,
          [employeeId, course.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });
      
      const completedModules = progress.filter(p => p.status === 'completed').map(p => p.module_id);
      const totalModules = modules.length;
      
      course.totalModules = totalModules;
      course.completedModules = completedModules.length;
      course.progress = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;
      course.status = progress.some(p => p.status === 'completed' && !p.module_id) ? 'completed' :
                      completedModules.length > 0 ? 'in_progress' : 'not_started';
    }
  }
  
  return courses;
}

/**
 * Get course by ID with modules
 */
async function getCourseById(courseId, employeeId = null) {
  const db = await dbPromise;
  
  const course = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM training_courses WHERE id = ?', [courseId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
  
  if (!course) {
    return null;
  }
  
  // Get modules
  const modules = await new Promise((resolve, reject) => {
    db.all(
      `SELECT m.*, q.passing_score, q.questions as quiz_questions
       FROM training_modules m
       LEFT JOIN training_quizzes q ON m.id = q.module_id
       WHERE m.course_id = ? ORDER BY m.order_index`,
      [courseId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  // Parse quiz questions
  modules.forEach(module => {
    if (module.quiz_questions) {
      try {
        module.quiz = {
          passingScore: module.passing_score,
          questions: JSON.parse(module.quiz_questions),
        };
      } catch (e) {
        module.quiz = null;
      }
    }
    delete module.quiz_questions;
    delete module.passing_score;
  });
  
  course.modules = modules;
  
  return course;
}

/**
 * Mark module as completed
 */
async function completeModule(employeeId, courseId, moduleId) {
  const db = await dbPromise;
  
  // Insert or update progress
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO training_progress 
       (employee_id, course_id, module_id, status, started_at, completed_at)
       VALUES (?, ?, ?, 'completed', datetime('now'), datetime('now'))
       ON CONFLICT(employee_id, course_id, module_id) 
       DO UPDATE SET status = 'completed', completed_at = datetime('now')`,
      [employeeId, courseId, moduleId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
  
  // Check if all modules completed
  const course = await getCourseById(courseId);
  const allModules = course.modules.map(m => m.id);
  const completed = await new Promise((resolve, reject) => {
    db.all(
      `SELECT module_id FROM training_progress 
       WHERE employee_id = ? AND course_id = ? AND status = 'completed' AND module_id IS NOT NULL`,
      [employeeId, courseId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.module_id));
      }
    );
  });
  
  const allCompleted = allModules.every(id => completed.includes(id));
  
  if (allCompleted && course.mandatory) {
    // Create certification
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO training_certifications 
         (employee_id, course_id, course_title, course_icon, earned_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(employee_id, course_id) DO NOTHING`,
        [employeeId, courseId, course.title, course.icon],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  
  return { success: true, allCompleted };
}

/**
 * Submit quiz answers
 */
async function submitQuiz(employeeId, courseId, moduleId, answers) {
  const db = await dbPromise;
  
  // Get quiz
  const module = await new Promise((resolve, reject) => {
    db.get(
      `SELECT m.*, q.passing_score, q.questions as quiz_questions
       FROM training_modules m
       JOIN training_quizzes q ON m.id = q.module_id
       WHERE m.id = ? AND m.course_id = ?`,
      [moduleId, courseId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
  
  if (!module || !module.quiz_questions) {
    throw new Error('Quiz not found');
  }
  
  const questions = JSON.parse(module.quiz_questions);
  let correct = 0;
  
  questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex || answers[q.id] === q.correctIndex) {
      correct++;
    }
  });
  
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= module.passing_score;
  
  // Save quiz result
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO training_progress 
       (employee_id, course_id, module_id, status, quiz_score, quiz_passed, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(employee_id, course_id, module_id)
       DO UPDATE SET quiz_score = ?, quiz_passed = ?, 
                     status = CASE WHEN ? = 1 THEN 'completed' ELSE status END,
                     completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END`,
      [
        employeeId, courseId, moduleId,
        passed ? 'completed' : 'in_progress',
        score, passed ? 1 : 0,
        passed ? new Date().toISOString() : null,
        score, passed ? 1 : 0, passed ? 1 : 0, passed ? 1 : 0,
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
  
  if (passed) {
    // Check if course completed
    await completeModule(employeeId, courseId, moduleId);
  }
  
  return { score, passed, correct, total: questions.length };
}

/**
 * Get employee progress
 */
async function getEmployeeProgress(employeeId) {
  const db = await dbPromise;
  
  const progress = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM training_progress WHERE employee_id = ?`,
      [employeeId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  return progress;
}

/**
 * Get employee certifications
 */
async function getEmployeeCertifications(employeeId) {
  const db = await dbPromise;
  
  const certs = await new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM training_certifications WHERE employee_id = ? ORDER BY earned_at DESC`,
      [employeeId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  return certs;
}

/**
 * Get team progress (for managers)
 */
async function getTeamProgress(req = null) {
  const db = await dbPromise;
  
  const teamData = await new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        tp.employee_id,
        COUNT(DISTINCT tp.course_id) as completed_courses,
        (SELECT COUNT(*) FROM training_courses WHERE is_active = 1) as total_courses,
        COUNT(DISTINCT tc.id) as certifications_count
       FROM training_progress tp
       LEFT JOIN training_certifications tc ON tp.employee_id = tc.employee_id AND tp.course_id = tc.course_id
       WHERE tp.status = 'completed' AND tp.module_id IS NULL
       GROUP BY tp.employee_id`,
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
  
  return teamData.map(emp => ({
    employeeId: emp.employee_id,
    completedCourses: emp.completed_courses,
    totalCourses: emp.total_courses,
    progress: emp.total_courses > 0 ? Math.round((emp.completed_courses / emp.total_courses) * 100) : 0,
    certifications: emp.certifications_count,
  }));
}

module.exports = {
  migrateCoursesToDB,
  getCourses,
  getCourseById,
  completeModule,
  submitQuiz,
  getEmployeeProgress,
  getEmployeeCertifications,
  getTeamProgress,
};


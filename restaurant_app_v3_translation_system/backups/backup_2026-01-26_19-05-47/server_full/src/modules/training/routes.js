/**
 * ENTERPRISE MODULE (CORE)
 * Phase: E8 - Training Routes (logic migrated)
 * Original: routes/training.js
 */

const express = require('express');
const router = express.Router();
const controller = require('./controllers/training.controller');

router.get('/courses', controller.getCourses);
router.get('/courses/:id', controller.getCourseById);
router.get('/courses/:courseId/modules/:moduleId', controller.getModuleById);
router.post('/courses/:courseId/modules/:moduleId/complete', controller.completeModule);
router.post('/courses/:courseId/modules/:moduleId/quiz', controller.submitQuiz);
router.get('/progress/:employeeId', controller.getEmployeeProgress);
router.get('/certifications/:employeeId', controller.getEmployeeCertifications);
router.get('/team-progress', controller.getTeamProgress);

module.exports = router;

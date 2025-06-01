const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const upload = require('../services/file-upload-service');

router.patch('/user',upload.single('profile'),asyncMiddleware(userController.updateUser));  // Update Self Account
router.get('/team/:id',asyncMiddleware(teamController.getTeam));
router.get('/team/:id/members',asyncMiddleware(teamController.getTeamMembers)); 
router.post('/mark-employee-in',asyncMiddleware(userController.markInAttendance));
router.post('/mark-employee-out',asyncMiddleware(userController.markOutAttendance));
router.post('/view-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/regularize-attendance',asyncMiddleware(userController.regularizeAttendanceRequest));
router.post('/view-reception-approve',asyncMiddleware(userController.approveInRequest));
router.post('/apply-leave-application',asyncMiddleware(userController.applyLeaveApplication));
router.post('/apply-assest-admin',asyncMiddleware(userController.applyAssest));
router.post('/view-leave-applications',asyncMiddleware(userController.viewLeaveApplications));
router.post('/view-assest-applications',asyncMiddleware(userController.viewAssestApplication));
router.post('/view-salary',asyncMiddleware(userController.viewSalary));

module.exports = router;
const router = require('express').Router();
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const upload = require('../services/file-upload-service');
const asyncMiddleware = require('../middlewares/async-middleware');
const { salarySlip } = require('../controllers/SalarySlip');

router.post(
    '/user',
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'employee_adhar_image', maxCount: 1 },
        { name: 'employee_pan_image', maxCount: 1 },
        { name: 'mother_adhar_image', maxCount: 1 },
        { name: 'father_adhar_image', maxCount: 1 },
        { name: 'tenth_marksheet_img', maxCount: 1 },
        { name: 'twelth_marksheet_img', maxCount: 1 },
        { name: 'Policeverification', maxCount: 1 }
    ]),
    asyncMiddleware(userController.createUser)
);// Create User
router.patch('/user/:id',upload.single('profile'),asyncMiddleware(userController.updateUser));      // Update User
router.get('/employees',asyncMiddleware(userController.getUsers));                                  // Employees
router.get('/employees/free',asyncMiddleware(userController.getFreeEmployees));                     // Free Employees
router.get('/employee/:id',asyncMiddleware(userController.getUser));                                // Employee
router.get('/user/:id',asyncMiddleware(userController.getUserNoFilter));                            // User - No Filter (Admin,Leader,Employee)
router.get('/admins',asyncMiddleware(userController.getUsers));                                     // Admins
router.get('/admin/:id',asyncMiddleware(userController.getUser));                                   // Admin
router.get('/leaders/free',asyncMiddleware(userController.getFreeLeaders));                         // Free Leaders
router.get('/leaders',asyncMiddleware(userController.getLeaders));                                  // Leaders
router.get('/leader/:id',asyncMiddleware(userController.getUser));                                  // Leader
router.post('/team',upload.single('image'),asyncMiddleware(teamController.createTeam));             // Create Team
router.patch('/team/:id',upload.single('image'),asyncMiddleware(teamController.updateTeam));        // Update Team
router.get('/teams',asyncMiddleware(teamController.getTeams));                                      // Teams
router.get('/team/:id',asyncMiddleware(teamController.getTeam));                                    // Team
router.get('/team/:id/members',asyncMiddleware(teamController.getTeamMembers));                     // Team Members
router.patch('/team/member/add',asyncMiddleware(teamController.addMember));                         // Add Team Member
router.patch('/team/member/remove',asyncMiddleware(teamController.removeMember));                   // Remove Team Member
router.patch('/team/leader/add',asyncMiddleware(teamController.addRemoveLeader));                   // Add Team Leader
router.patch('/team/leader/remove',asyncMiddleware(teamController.addRemoveLeader));                // Remove Team Leader
router.get('/counts',asyncMiddleware(teamController.getCounts));                                    // Counts
router.post('/view-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/view-leave-applications',asyncMiddleware(userController.viewLeaveApplications));
router.post('/view-assest-applications',asyncMiddleware(userController.viewAssestApplication));
router.post('/assign-employee-salary',asyncMiddleware(userController.assignEmployeeSalary));
router.post('/assign-employee-later',asyncMiddleware(userController.assignletter));
router.post('/update-employee-salary/',asyncMiddleware(userController.updateEmployeeSalary));
router.post('/view-all-salary',asyncMiddleware(userController.viewSalary));
router.post('/update-leave/:id',asyncMiddleware(userController.updateLeaveApplication));
router.post('/update-assest/:id',asyncMiddleware(userController.updateAssestApplication));

// attendace 
router.get('/view-reception-attendance',asyncMiddleware(userController.getAllTodayInRequests));
router.post('/view-reception-approve',asyncMiddleware(userController.approveInRequest));
router.post('/all-regularize-request',asyncMiddleware(userController.getAllOutRegularizeRequests));
router.post('/all-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));


// salary
router.post('/genrate-salary-slip',salarySlip);


module.exports = router;
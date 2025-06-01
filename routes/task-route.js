const router = require('express').Router();
const salarySlip  = require('../controllers/SalarySlip');
const taskController = require('../controllers/task-controller');
const {auth} = require('../middlewares/auth-middleware')
const upload = require('../services/excel-upload-services');
const eventUpload = require('../services/events-service');


// Employee routes
router.post('/', upload.single("file"), taskController.createTaskWithLeads); 
router.put('/updatelead',  taskController.updateLead);
router.get('/user-today/:_id', taskController.getTodayTasks);
router.get('/getlead/:id', taskController.getLeadsByTaskId);
router.put('/update-status', taskController.updateTaskStatusAndRemark);
router.post('/createDeals', taskController.createDealFromLead);
router.get('/get-salesLeader', taskController.getSalesLeaders);
router.get('/get-allEmployee', taskController.getEmployee);
router.get('/getDeals/:leaderId', taskController.getDealsByLeader);
router.post('/assignDeals', taskController.assignEmployeeToDeal);
router.get('/getDealss/:id', taskController.getMyDeals);
router.get('/todayevents', salarySlip.getTodayEvents);
router.put('/updateDeals', taskController.updateDealStage);
router.post("/attendance-report", salarySlip.getAttendanceReport);
router.post("/meetings/create", taskController.createMeeting);
router.get("/meetings/today/:id", taskController.getTodayMeetingsByEmployee);
router.post('/events', eventUpload.single('image'), taskController.createEvent);
router.get("/events/:date", taskController.getEventsByDate);
router.get("/filterDeals", taskController.getFilteredDeals);

// router.get('/user-history/:id', taskController.getUserHistoryTasks);

// // for admin
// router.get('/admin/today', taskController.getTodayTasks);
// router.get('/admin/history', taskController.getHistoryTasks);

module.exports = router;
const mongoose = require('mongoose');
const Task = require('../models/task_models');
const Lead = require('../models/Lead-modal');
const User = require('../models/user-model');
const Deal = require('../models/Deals');
const Meeting = require('../models/Meeting');
const xlsx = require('xlsx');
const Event = require('../models/Events');


exports.createTaskWithLeads = async (req, res, next) => {
  try {
    const { title, priority, Status, description, team, createdFor, assignedTo, createdBy } = req.body;
    const assignedBy = createdBy;


    // 1. Create Task
    const task = await Task.create({ title, priority, description, team, assignedTo, Status, assignedBy });

    // 2. Check if the file is provided
    if (req.file && req.file.buffer) {
      // File is provided, proceed with reading Excel and creating leads

      // Read Excel
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      // Prepare leads
      const allLeads = data.map(row => ({
        name: row.NAME,
        Contact_No: String(row.CONTACT),
        address: row.ADDRESS,
        District: row.DISTRICT,
        State: row.STATE,
        result: ['Pass', 'Fail'].includes(row.RESULT) ? row.RESULT : 'Pending',
        interest: ['High', 'Medium', 'Low'].includes(row.INTEREST) ? row.INTEREST : 'Medium',
        taskID: task._id
      }));

      // Check duplicates by Contact_No
      const contactNos = allLeads.map(lead => lead.Contact_No);
      const existingLeads = await Lead.find({ Contact_No: { $in: contactNos }, taskID: task._id });

      const existingContactsSet = new Set(existingLeads.map(lead => lead.Contact_No));
      const nonDuplicateLeads = allLeads.filter(lead => !existingContactsSet.has(lead.Contact_No));
      const duplicateLeads = allLeads.filter(lead => existingContactsSet.has(lead.Contact_No));

      // Insert non-duplicates
      await Lead.insertMany(nonDuplicateLeads);

      res.json({
        success: true,
        message: "Task created. Non-duplicate leads added.",
        task,
        duplicateLeads // Send duplicates back to frontend
      });
    } else {
      // If no file is provided, just send success response without leads
      res.json({
        success: true,
        message: "Task created. No file provided, so no leads added.",
        task
      });
    }

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Controller
exports.getTodayTasks = async (req, res, next) => {
  try {
    const employeeID = req.params._id;
    const { date } = req.query;

    let startDate, endDate;

    if (date) {
      // Parse the provided date string (format: YYYY-MM-DD)
      const selectedDate = new Date(date);

      if (isNaN(selectedDate)) {
        return res.status(400).json({
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD.",
        });
      }

      // Set time to start and end of the day
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    console.log("📅 Filtered Start:", startDate);
    console.log("📅 Filtered End:", endDate);

    // Step 1: Find tasks assigned to the employee within the date range
    const tasks = await Task.find({
      assignedTo: employeeID,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    console.log("✅ Tasks found:", tasks.length);
    if (tasks.length === 0) {
      console.log("⚠️ No tasks found for this date.");
    }

    const taskIDs = tasks.map((task) => task._id);
    console.log("📌 Task IDs:", taskIDs);

    // Step 2: Find leads linked to these tasks
    const leads = await Lead.find({ taskID: { $in: taskIDs } });
    console.log("📞 Leads found:", leads.length);

    res.json({
      success: true,
      data: {
        tasks,
        leads,
      },
    });
  } catch (error) {
    console.error("❌ Error in getTodayTasks:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Task ID by id
exports.getLeadsByTaskId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid taskId' });
  }

  try {
    const leads = await Lead.find({ taskID: id }).populate('taskID');
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads by taskId:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateLead = async (req, res) => {
  try {
    console.log("➡️ Incoming Update Request:", req.body);

    const { leadID, result, duration, interest, reminder } = req.body;

    if (!leadID) {
      console.log("❌ Missing leadID");
      return res.status(400).json({ success: false, message: "leadID is required" });
    }

    console.log("🔍 Finding and Updating Lead ID:", leadID);

    const updated = await Lead.findByIdAndUpdate(
      leadID,
      {
        result,
        duration,
        interest,
        reminder,
        updatedBy: req.user?._id || "test-user-id",
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      console.log("❌ Lead not found for ID:", leadID);
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    console.log("✅ Lead Updated Successfully:", updated);

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("🔥 Error While Updating Lead:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller
exports.updateTaskStatusAndRemark = async (req, res, next) => {
  try {

    const { Status, remark, taskId } = req.body;

    console.log("🛠️ Updating Task:", taskId);
    console.log("➡️ New Status:", Status);
    console.log("📝 Remark:", remark);

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { Status, remark },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    console.log("✅ Task Updated:", updatedTask);

    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("❌ Error in updateTaskStatusAndRemark:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.createDealFromLead = async (req, res) => {
  try {
    const { leadID, value, assigned_leader, reminder } = req.body;

    if (!leadID || !assigned_leader) {
      return res.status(400).json({
        success: false,
        message: "leadID and assigned_leader are required"
      });
    }

    // 🔍 Fetch Lead
    const lead = await Lead.findById(leadID);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    // ✅ Create Deal using Lead data
    const newDeal = new Deal({
      lead: leadID,
      title: lead.title || `Deal for ${lead.name}`,
      client_name: lead.name,
      value,
      assigned_leader,
      reminder,
      created_by: req.user?._id || "test-user-id"
    });

    await newDeal.save();

    // 🛠️ Update Lead status/result to 'Assigned'
    lead.result = "Assigned"; // or whatever field/status you use
    await lead.save();

    res.status(201).json({
      success: true,
      message: "Deal created and Lead marked as Assigned",
      data: newDeal
    });
  } catch (error) {
    console.error("🔥 Error in creating deal:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDealsByLeader = async (req, res) => {
  try {
    const { leaderId } = req.params;

    console.log("🔍 Fetching Deals for Leader:", leaderId);

    const deals = await Deal.find({ assigned_leader: leaderId })
      .populate("lead")
      .populate("assigned_employee", "name email profilePic");


    res.status(200).json({ success: true, data: deals });

  } catch (error) {
    console.error("🔥 Error Fetching Deals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// controllers/dealController.js

exports.assignEmployeeToDeal = async (req, res) => {
  try {
    const { dealID, assigned_employee, deadline } = req.body;

    if (!dealID || !assigned_employee || !deadline) {
      return res.status(400).json({ success: false, message: "dealID and assigned_employee are required" });
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      dealID,
      { assigned_employee, deadline },
      { new: true }
    );

    if (!updatedDeal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    res.json({ success: true, message: "Employee assigned to deal", data: updatedDeal });
  } catch (error) {
    console.error("🔥 Error in assigning employee:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// employe dealssss  
// getMyDeals.js

exports.getMyDeals = async (req, res) => {
  try {
    const { id } = req.params; // employeeId from URL
    const { startDate, endDate } = req.query;

    // Validate ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidObjectId) {
      return res.status(400).json({ success: false, message: "Invalid employee ID" });
    }

    const employeeObjectId = mongoose.Types.ObjectId(id);

    // Build query object
    const query = {
      assigned_employee: employeeObjectId,
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(`${startDate}T00:00:00`),
        $lte: new Date(`${endDate}T23:59:59`)
      };
    }

    // Query database
    const deals = await Deal.find(query)
      .populate('lead')
      .populate('assigned_leader', 'name')
      .sort({ updatedAt: -1 });

    console.log("📊 Total deals found:", deals.length);

    if (deals.length === 0) {
      console.warn("⚠️ No deals found for this employee");
    } else {
      console.log("✅ Deals fetched successfully. First deal sample:", deals[0]);
    }

    res.json({ success: true, data: deals });
  } catch (err) {
    console.error('🔥 Error in getMyDeals:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// controller/dealController.js

exports.updateDealStage = async (req, res) => {
  try {
    const { dealId, newStage } = req.body;

    if (!dealId || !newStage) {
      return res.status(400).json({ success: false, message: 'Deal ID and new stage are required' });
    }

    const allowedStages = ['untouched', 'next_meeting', 'quotation', 'won', 'Loss'];
    if (!allowedStages.includes(newStage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage value' });
    }

    const updated = await Deal.findByIdAndUpdate(
      dealId,
      { status: newStage },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesLeaders = async (req, res) => {
  try {
    const salesLeaders = await User.find({ type: 'leader' }).select('_id name email');
    res.status(200).json({ success: true, data: salesLeaders });
  } catch (error) {
    console.error('❌ Error fetching sales leaders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// for sales leader 
exports.getEmployee = async (req, res) => {
  try {
    const { type } = req.query;
    const salesLeaders = await User.find({ type: 'employee', branch: type == 'employee' && { $in: ['tech', 'telecaller'] } }).select('_id name email');
    res.status(200).json({ success: true, data: salesLeaders });
  } catch (error) {
    console.error('❌ Error fetching sales leaders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodayMeetingsByEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Employee ID:", id);

    // Get today's date in UTC
    const today = new Date();

    // Set the start of the day (00:00:00) in UTC for today's date
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0));

    // Set the end of the day (23:59:59.999) in UTC for today's date
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    console.log("Start of Day (UTC):", startOfDay);
    console.log("End of Day (UTC):", endOfDay);

    // Fetch meetings for the given employee that are scheduled for today
    const meetings = await Meeting.find({
      employeeId: mongoose.Types.ObjectId(id), // Ensure correct field name (`employeeId`)
      startDate: {
        $gte: startOfDay.toISOString(),  // Start of the day in ISO format
        $lte: endOfDay.toISOString()    // End of the day in ISO format
      }
    }).populate('dealId'); // Optionally populate related deal data if needed

    console.log("Meetings Found:", meetings);

    // Return the meetings
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error("❌ Error fetching today's meetings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};





// Controller to create a new meeting
// Controller to create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    // Extract meeting details from the request body
    const { title, venue, location, startDate, startTime, endDate, endTime, dealId, employeeID } = req.body;

    // Log the received data to debug
    console.log("Received meeting data:", req.body);

    // Validate the incoming data
    if (!title || !venue || !location || !startDate || !startTime || !endDate || !endTime || !dealId || !employeeID) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    // Validate the start and end dates
    if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
      return res.status(400).json({ success: false, message: "Invalid start or end date." });
    }

    // Create a new meeting object
    const newMeeting = new Meeting({
      title,
      venue,
      location,
      startDate,
      startTime,
      endDate,
      endTime,
      dealId,
      employeeId: employeeID, // Ensure the correct field name is used
      createdAt: new Date(),
    });

    // Save the meeting to the database
    await newMeeting.save();

    // Respond with a success message and the new meeting data
    res.status(201).json({
      success: true,
      message: "Meeting created successfully!",
      data: newMeeting,
    });
  } catch (error) {
    console.error("❌ Error creating meeting:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.createEvent = async (req, res) => {
  try {
    // Extract event details from the request body
    const { title, type, date, time, location, description } = req.body;

    // Log the received data to debug
    console.log("Received event data:", req.body);

    // Validate the incoming data
    if (!title || !type || !date || !time || !location || !description) {
      return res.status(400).json({ success: false, message: "Please provide all required fields." });
    }

    // If an image is uploaded, get the image file path
    const image = req.file ? `/storage/events/${req.file.filename}` : null; // Check if the image exists in the request

    // Create a new event object
    const newEvent = new Event({
      title,
      type,
      date,
      time,
      location,
      description,
      image,  // Add the image URL (if image exists)
    });

    // Save the event to the database
    await newEvent.save();

    // Respond with a success message and the new event data
    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      data: newEvent,
    });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params; // Get the date parameter from the request

    // Ensure the date format is valid
    const validDate = new Date(date);
    if (isNaN(validDate)) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    // Fetch events on the specific date
    const events = await Event.find({ date: validDate.toISOString().split('T')[0] }); // Match the date without time part

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: "No events found for this date." });
    }

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("❌ Error fetching events by date:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getFilteredDeals = async (req, res) => {
  try {
    const { assigned_leader, assigned_employee, status } = req.query;

    const query = {};

    if (assigned_leader && mongoose.Types.ObjectId.isValid(assigned_leader)) {
      query.assigned_leader = new mongoose.Types.ObjectId(assigned_leader);
    }

    if (assigned_employee && mongoose.Types.ObjectId.isValid(assigned_employee)) {
      query.assigned_employee = new mongoose.Types.ObjectId(assigned_employee);
    }
    const validStatuses = ['untouched', 'next_meeting', 'quotation', 'won', 'Loss'];
    if (status && validStatuses.includes(status)) {
      query.status = status;
    } else if (!status) {
      query.status = 'won';
    }
    query.createdAt = {
      $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    };

    const deals = await Deal.find(query)
      .populate('lead')
      .populate('assigned_leader', 'name email')
      .populate('assigned_employee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: deals });
  } catch (err) {
    console.error('🔥 Error fetching filtered deals:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


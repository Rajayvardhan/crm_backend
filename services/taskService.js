const TaskModel = require("../models/Task");

class TaskService {
  createTask = async (taskData) => await TaskModel.create(taskData);

  getAllTasks = async () => await TaskModel.find().populate("createdBy", "name email");

  getTasksByUser = async (userId) => await TaskModel.find({ createdBy: userId });

  updateTask = async (id, updateData) => await TaskModel.findByIdAndUpdate(id, updateData, { new: true });
}

module.exports = new TaskService();
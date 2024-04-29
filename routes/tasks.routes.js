const express = require("express");

const tasksRouter = express.Router();
const {
  authenticateUser,
  authorizeUser,
} = require("../middleware/user.middleware");

const { Tasks } = require("../model/tasks.model");

tasksRouter.get(
  "/",
  authenticateUser,
  authorizeUser("admin", "manager", "member"),
  async (req, res) => {
    try {
      let query = {};

      const todayStart = new Date().setHours(0, 0, 0, 0); 
      const todayEnd = new Date().setHours(23, 59, 59, 999);

      query = { ...query, createdAt: { $gte: todayStart, $lt: todayEnd } };

      if (req.role == "member") {
        query = { ...query, userId: req.userId };

        const tasks = await Tasks.find(query);

        return res.status(200).json({ data: tasks });
      } else if (req.role == "manager") {
        const tasks = await Tasks.find(query);

        return res.status(200).json({ data: tasks });
      } else if (req.role == "admin") {
        const tasks = await Tasks.find(query);

        let tasksInfo = await Tasks.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(todayStart),
                $lt: new Date(todayEnd),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalTasks: {
                $sum: 1,
              },
              avgCompleted: {
                $avg: {
                  $cond: [{ $eq: ["$completed", true] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalTasks: 1,
              avgCompleted: { $round: ["$avgCompleted", 2] },
            },
          },
        ]);

        tasksInfo = tasksInfo.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});

        // console.log(tasksInfo);
        return res.status(200).json({ data: { ...tasksInfo, tasks } });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
);

//access : "member"
tasksRouter.post(
  "/",
  authenticateUser,
  authorizeUser("member"),
  async (req, res) => {
    try {
      const { title, description } = req.body;

      if (title && description) {
        const task = new Tasks({
          title,
          description,
          userId: req.userId,
        });

        await task.save();

        return res.status(200).json({ message: "New task has been created." });
      } else {
        return res.status(400).json({
          error: true,
          message:
            "Some fields are missing. [title, description] all are required",
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
);

//access : "member"
tasksRouter.patch(
  "/:taskId",
  authenticateUser,
  authorizeUser("member"),
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Tasks.findById(taskId);

      if (!task) {
        return res.status(400).json({
          error: true,
          message: `Task with ID : ${taskId} doesn't exists`,
        });
      }

      if (task.userId == req.userId) {
        const { title, description, completed } = req.body;

        const task = await Tasks.findByIdAndUpdate(
          taskId,
          {
            title,
            description,
            completed,
            updatedAt: Date.now(),
          },
          {
            new: true,
            upsert: true,
          }
        );
        return res
          .status(200)
          .json({ message: `Task with ID : ${taskId} has been updated` });
      } else {
        return res.status(400).json({
          error: true,
          message: `You are not authorized to update the task with ID : ${taskId}`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
);
//access : "member"
tasksRouter.delete(
  "/:taskId",
  authenticateUser,
  authorizeUser("member"),
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Tasks.findById(taskId);

      if (!task) {
        return res.status(400).json({
          error: true,
          message: `Task with ID : ${taskId} doesn't exists`,
        });
      }

      if (task.userId == req.userId) {
        task.deleteStatus = true;
         
      } else {
        return res.status(400).json({
          error: true,
          message: `You are not authorized to delete the task with ID : ${taskId}`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
);
//access : "manager"
tasksRouter.delete(
  "/:taskId",
  authenticateUser,
  authorizeUser("manager"),
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Tasks.findById(taskId);

      if (!task) {
        return res.status(400).json({
          error: true,
          message: `Task with ID : ${taskId} doesn't exists`,
        });
      }

      if (task.userId == req.userId) {
        if(task.deleteStatus){
          const task = await Tasks.findByIdAndDelete(taskId);
          return res
            .status(200)
            .json({ message: `Task with ID : ${taskId} has been Deleted` });
        }
      } else {
        return res.status(400).json({
          error: true,
          message: `You are not authorized to delete the task with ID : ${taskId}`,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
);

module.exports = { tasksRouter };



const mongoose = require('mongoose');

const taskStatusRequestSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedStatus: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    required: true
  },
  currentStatus: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    required: true
  },
  reason: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalReason: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient querying
taskStatusRequestSchema.index({ projectId: 1, status: 1, createdAt: -1 });
taskStatusRequestSchema.index({ taskId: 1 });

module.exports = mongoose.model('TaskStatusRequest', taskStatusRequestSchema);

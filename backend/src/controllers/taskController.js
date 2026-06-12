const supabase = require('../config/supabase.js');

// ─────────────────────────────────────────────
// CREATE a task under a goal
// POST /api/tasks
// Body: { goal_id, title, description, due_date, estimated_hours }
// Only mentor (assigned_by) or mentee can create tasks
// ─────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { goal_id, title, description, due_date, estimated_hours } = req.body;

    if (!goal_id || !title) {
      return res.status(400).json({ error: 'goal_id and title are required' });
    }

    // Verify the goal exists
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id, mentorship_id, mentee_id')
      .eq('id', goal_id)
      .single();

    if (goalError || !goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          goal_id,
          title,
          description: description || null,
          status: 'pending',
          assigned_by: user_id,
          due_date: due_date || null,
          estimated_hours: estimated_hours || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: 'Task created successfully', task: data });
  } catch (err) {
    console.error('createTask error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// GET all tasks for a goal
// GET /api/tasks/goal/:goalId
// ─────────────────────────────────────────────
const getTasksByGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        task_submissions (
          id, submission_content, submission_url,
          feedback, score, reviewed_at, created_at
        )
      `
      )
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ tasks: data });
  } catch (err) {
    console.error('getTasksByGoal error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// GET a single task by ID
// GET /api/tasks/:taskId
// ─────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        *,
        task_submissions (*)
      `
      )
      .eq('id', taskId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ task: data });
  } catch (err) {
    console.error('getTaskById error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// UPDATE a task
// PUT /api/tasks/:taskId
// Body: { title, description, status, due_date, estimated_hours, actual_hours }
// ─────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, due_date, estimated_hours, actual_hours } = req.body;

    // Verify task exists
    const { data: existing, error: findError } = await supabase
      .from('tasks')
      .select('id, goal_id, status')
      .eq('id', taskId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (due_date !== undefined) updates.due_date = due_date;
    if (estimated_hours !== undefined) updates.estimated_hours = estimated_hours;
    if (actual_hours !== undefined) updates.actual_hours = actual_hours;

    // Auto-set completed_date when marked completed
    if (status === 'completed') {
      updates.completed_date = new Date().toISOString().split('T')[0];
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    // After status update → recalculate the parent goal's progress automatically
    if (status !== undefined) {
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('goal_id', existing.goal_id);

      if (allTasks && allTasks.length > 0) {
        const completed = allTasks.filter((t) => t.status === 'completed').length;
        const progress = Math.round((completed / allTasks.length) * 100);

        await supabase
          .from('goals')
          .update({ progress_percentage: progress, updated_at: new Date().toISOString() })
          .eq('id', existing.goal_id);
      }
    }

    return res.status(200).json({ message: 'Task updated successfully', task: data });
  } catch (err) {
    console.error('updateTask error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// DELETE a task
// DELETE /api/tasks/:taskId
// ─────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data: existing, error: findError } = await supabase
      .from('tasks')
      .select('id')
      .eq('id', taskId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete submissions first (foreign key constraint)
    await supabase.from('task_submissions').delete().eq('task_id', taskId);

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ═══════════════════════════════════════════════════════════════
// TASK SUBMISSIONS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// SUBMIT a task (mentee submits their work)
// POST /api/tasks/:taskId/submit
// Body: { submission_content, submission_url }
// ─────────────────────────────────────────────
const submitTask = async (req, res) => {
  try {
    const mentee_id = req.user.id;
    const { taskId } = req.params;
    const { submission_content, submission_url } = req.body;

    if (!submission_content && !submission_url) {
      return res.status(400).json({ error: 'submission_content or submission_url is required' });
    }

    // Verify task exists
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, status')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      return res.status(400).json({ error: `Cannot submit a ${task.status} task` });
    }

    // Insert submission
    const { data: submission, error: subError } = await supabase
      .from('task_submissions')
      .insert([
        {
          task_id: taskId,
          mentee_id,
          submission_content: submission_content || null,
          submission_url: submission_url || null,
        },
      ])
      .select()
      .single();

    if (subError) throw subError;

    // Update task status to 'submitted'
    await supabase
      .from('tasks')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', taskId);

    return res.status(201).json({ message: 'Task submitted successfully', submission });
  } catch (err) {
    console.error('submitTask error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// REVIEW a submission (mentor reviews)
// PUT /api/tasks/submissions/:submissionId/review
// Body: { feedback, score }  (score 0–100)
// ─────────────────────────────────────────────
const reviewSubmission = async (req, res) => {
  try {
    const reviewer_id = req.user.id;
    const { submissionId } = req.params;
    const { feedback, score } = req.body;

    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    const { data: existing, error: findError } = await supabase
      .from('task_submissions')
      .select('id, task_id')
      .eq('id', submissionId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('task_submissions')
      .update({
        feedback: feedback || null,
        score: score !== undefined ? score : null,
        reviewed_by: reviewer_id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;

    // Update task status to 'reviewed'
    await supabase
      .from('tasks')
      .update({ status: 'reviewed', updated_at: now })
      .eq('id', existing.task_id);

    return res.status(200).json({ message: 'Submission reviewed successfully', submission: data });
  } catch (err) {
    console.error('reviewSubmission error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────
// GET all submissions for a task
// GET /api/tasks/:taskId/submissions
// ─────────────────────────────────────────────
const getSubmissionsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data, error } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ submissions: data });
  } catch (err) {
    console.error('getSubmissionsByTask error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTasksByGoal,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  reviewSubmission,
  getSubmissionsByTask,
};
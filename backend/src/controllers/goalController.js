const supabase = require("../config/supabase");

// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const { mentorship_id } = req.query;

    let query = supabase.from("goals").select("*");

    if (mentorship_id) {
      query = query.eq("mentorship_id", mentorship_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const {
      mentorship_id,
      mentee_id,
      title,
      description,
      status,
      priority,
      target_date,
      progress_percentage,
    } = req.body;

    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          mentorship_id,
          mentee_id,
          title,
          description,
          status,
          priority,
          target_date,
          progress_percentage,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      target_date,
      progress_percentage,
    } = req.body;

    const { data, error } = await supabase
      .from("goals")
      .update({
        title,
        description,
        status,
        priority,
        target_date,
        progress_percentage,
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
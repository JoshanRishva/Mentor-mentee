const pool = require("../config/db");

// =====================================================
// GET ALL MENTORSHIPS
// =====================================================
const getAllMentorships = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        m.*,
        p.title AS project_title,
        mentor.full_name AS mentor_name,
        mentee.full_name AS mentee_name
      FROM mentorships m
      LEFT JOIN projects p
        ON p.id = m.project_id
      LEFT JOIN users mentor
        ON mentor.id = m.mentor_id
      LEFT JOIN users mentee
        ON mentee.id = m.mentee_id
      ORDER BY m.created_at DESC
    `);

    res.json({
      total: rows.length,
      mentorships: rows
    });

  } catch (err) {
    console.error("getAllMentorships error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// GET MENTORSHIP BY ID
// =====================================================
const getMentorshipById = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        m.*,
        p.title AS project_title,
        mentor.full_name AS mentor_name,
        mentee.full_name AS mentee_name
      FROM mentorships m
      LEFT JOIN projects p
        ON p.id = m.project_id
      LEFT JOIN users mentor
        ON mentor.id = m.mentor_id
      LEFT JOIN users mentee
        ON mentee.id = m.mentee_id
      WHERE m.id = $1
      `,
      [mentorshipId]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Mentorship not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("getMentorshipById error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// GET MENTOR MENTORSHIPS
// =====================================================
const getMentorMentorships = async (req, res) => {
  const { mentorId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        m.*,
        p.title AS project_title,
        mentee.full_name AS mentee_name
      FROM mentorships m
      LEFT JOIN projects p
        ON p.id = m.project_id
      LEFT JOIN users mentee
        ON mentee.id = m.mentee_id
      WHERE m.mentor_id = $1
      ORDER BY m.created_at DESC
      `,
      [mentorId]
    );

    res.json({
      total: rows.length,
      mentorships: rows
    });

  } catch (err) {
    console.error("getMentorMentorships error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// GET MENTEE MENTORSHIPS
// =====================================================
const getMenteeMentorships = async (req, res) => {
  const { menteeId } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        m.*,
        p.title AS project_title,
        mentor.full_name AS mentor_name
      FROM mentorships m
      LEFT JOIN projects p
        ON p.id = m.project_id
      LEFT JOIN users mentor
        ON mentor.id = m.mentor_id
      WHERE m.mentee_id = $1
      ORDER BY m.created_at DESC
      `,
      [menteeId]
    );

    res.json({
      total: rows.length,
      mentorships: rows
    });

  } catch (err) {
    console.error("getMenteeMentorships error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// COMPLETE MENTORSHIP
// =====================================================
const completeMentorship = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM mentorships WHERE id = $1`,
      [mentorshipId]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: "Mentorship not found"
      });
    }

    if (existing[0].status === "completed") {
      return res.status(409).json({
        error: "Mentorship already completed"
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE mentorships
      SET
        status = 'completed',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [mentorshipId]
    );

    res.json({
      message: "Mentorship completed successfully",
      mentorship: rows[0]
    });

  } catch (err) {
    console.error("completeMentorship error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// CANCEL MENTORSHIP
// =====================================================
const cancelMentorship = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM mentorships WHERE id = $1`,
      [mentorshipId]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: "Mentorship not found"
      });
    }

    if (existing[0].status === "cancelled") {
      return res.status(409).json({
        error: "Mentorship already cancelled"
      });
    }

    const { rows } = await pool.query(
      `
      UPDATE mentorships
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [mentorshipId]
    );

    res.json({
      message: "Mentorship cancelled successfully",
      mentorship: rows[0]
    });

  } catch (err) {
    console.error("cancelMentorship error:", err);
    res.status(500).json({
      error: "Internal server error"
    });
  }
};

// =====================================================
// CREATE MENTORSHIP FROM ACCEPTED REQUEST
// =====================================================
const createMentorshipFromRequest = async (req, res) => {
  const { mentor_id, mentee_id, request_id, project_id, goals_summary } = req.body;

  try {
    // 1. Check if request exists
    const { rows: requestRows } = await pool.query(
      `SELECT * FROM mentorship_requests WHERE id = $1`,
      [request_id]
    );

    if (!requestRows.length) {
      return res.status(404).json({ error: "Mentorship request not found" });
    }

    // 2. Check if request is already accepted
    if (requestRows[0].status === "accepted") {
      return res.status(409).json({ error: "Request already accepted" });
    }

    // 3. Update the request status to accepted
    await pool.query(
      `UPDATE mentorship_requests
       SET status = 'accepted', updated_at = NOW()
       WHERE id = $1`,
      [request_id]
    );

    // 4. Insert into mentorships table
    const { rows } = await pool.query(
      `INSERT INTO mentorships
        (id, mentor_id, mentee_id, request_id, project_id, status, start_date, goals_summary)
       VALUES
        (gen_random_uuid(), $1, $2, $3, $4, 'active', CURRENT_DATE, $5)
       RETURNING *`,
      [mentor_id, mentee_id, request_id, project_id, goals_summary]
    );

    res.status(201).json({
      message: "Mentorship created successfully",
      mentorship: rows[0]
    });

  } catch (err) {
    console.error("createMentorshipFromRequest error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  getAllMentorships,
  getMentorshipById,
  getMentorMentorships,
  getMenteeMentorships,
  completeMentorship,
  cancelMentorship,
  createMentorshipFromRequest
};
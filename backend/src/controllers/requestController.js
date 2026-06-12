require("dotenv").config();
const pool = require("../config/db");

// ── Config ─────────────────────────────────────────────────────────────────
const EXPIRY_MINUTES = 1440; // 24 h  (change to 5 for dev testing)

// ── Helper: flush expired pending requests ─────────────────────────────────
// Called before every read/write so no consumer ever sees a stale pending row.
const flushExpired = async () => {
  await pool.query(
    `UPDATE mentorship_requests
     SET    status     = 'expired',
            updated_at = NOW()
     WHERE  status     = 'pending'
       AND  expires_at IS NOT NULL
       AND  expires_at < NOW()`
  );
};

// ─── 1. Mentee sends a mentorship request ──────────────────────────────────
// POST /api/requests
// Body: { projectId, mentorId, message? }
// Auth: req.user.id  →  menteeId (never trusted from body)
const sendRequest = async (req, res) => {
  const { projectId, mentorId, message } = req.body;

  // ── When auth middleware is wired, replace this line:
  // const menteeId = req.user.id;
  const menteeId = req.body.menteeId; // temporary until auth middleware

  if (!projectId) return res.status(400).json({ error: "projectId is required." });
  if (!mentorId)  return res.status(400).json({ error: "mentorId is required." });
  if (!menteeId)  return res.status(400).json({ error: "menteeId is required." });

  try {
    await flushExpired();

    // Guard 1 — project exists, is active, and belongs to this mentee
    const { rows: projectRows } = await pool.query(
      `SELECT id, mentee_id, status, required_skills
       FROM   projects
       WHERE  id = $1`,
      [projectId]
    );

    if (!projectRows.length)
      return res.status(404).json({ error: "Project not found." });

    if (projectRows[0].mentee_id !== menteeId)
      return res.status(403).json({ error: "This project does not belong to you." });

    if (projectRows[0].status !== "active")
      return res.status(400).json({ error: "Only active projects can request mentors." });

    // Guard 2 — mentor exists
    const { rows: mentorRows } = await pool.query(
      `SELECT id FROM mentor_profiles WHERE id = $1`,
      [mentorId]
    );

    if (!mentorRows.length)
      return res.status(404).json({ error: "Mentor not found." });

    // Guard 3 — project already has an accepted mentor
    const { rows: accepted } = await pool.query(
      `SELECT id FROM mentorship_requests
       WHERE  project_id = $1
         AND  status     = 'accepted'`,
      [projectId]
    );

    if (accepted.length)
      return res.status(409).json({ error: "This project already has an accepted mentor." });

    // Guard 4 — no active (pending/accepted) request to THIS mentor for THIS project.
    // expired / rejected rows are ignored → mentee can re-send after expiry.
    // mentee_id is NOT part of this check — project_id already implies the mentee.
    const { rows: duplicate } = await pool.query(
      `SELECT id, status
       FROM   mentorship_requests
       WHERE  project_id = $1
         AND  mentor_id  = $2
         AND  status     IN ('pending', 'accepted')`,
      [projectId, mentorId]
    );

    if (duplicate.length)
      return res.status(409).json({
        error: `A ${duplicate[0].status} request already exists for this mentor on this project.`,
      });

    // ── Insert ────────────────────────────────────────────────────────────
    // mentee_id is sourced from the verified project row — never from req.body.
    const { rows } = await pool.query(
      `INSERT INTO mentorship_requests
         (project_id, mentor_id, mentee_id, message, requested_skills, status, expires_at)
       VALUES
         ($1, $2, $3, $4, $5, 'pending', NOW() + INTERVAL '${EXPIRY_MINUTES} minutes')
       RETURNING
         id, project_id, mentor_id, mentee_id,
         status, message, requested_skills, expires_at, created_at`,
      [
        projectId,
        mentorId,
        projectRows[0].mentee_id,       // sourced from DB, not from client
        message || null,
        projectRows[0].required_skills, // carry skills from the project
      ]
    );

    res.status(201).json({ message: "Mentorship request sent.", request: rows[0] });

  } catch (err) {
    // Catch race condition: two simultaneous requests bypass Guard 4 —
    // the partial unique index (uq_project_mentor_active) rejects the second.
    if (err.constraint === "uq_project_mentor_active") {
      return res.status(409).json({
        error: "A request to this mentor already exists for this project.",
      });
    }
    console.error("sendRequest error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── 2. Mentor views incoming requests ────────────────────────────────────
// GET /api/requests/mentor/:mentorId?status=pending
const getMentorRequests = async (req, res) => {
  const { mentorId } = req.params;
  const { status } = req.query;

  try {
    await flushExpired();

    const conditions = ["mr.mentor_id = $1"];
    const params     = [mentorId];

    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT
         mr.id,
         mr.status,
         mr.message,
         mr.requested_skills,
         mr.response_message,
         mr.responded_at,
         mr.expires_at,
         mr.created_at,
         -- project info
         p.id          AS project_id,
         p.title       AS project_title,
         p.description AS project_description,
         p.project_summary,
         -- mentee info
         u.id          AS mentee_id,
         u.full_name   AS mentee_name,
         u.email       AS mentee_email
       FROM   mentorship_requests mr
       JOIN   projects p ON mr.project_id = p.id
       JOIN   users    u ON mr.mentee_id  = u.id
       WHERE  ${conditions.join(" AND ")}
       ORDER  BY mr.created_at DESC`,
      params
    );

    res.json({ total: rows.length, requests: rows });

  } catch (err) {
    console.error("getMentorRequests error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── 3. Mentee views requests they have sent ──────────────────────────────
// GET /api/requests/mentee/:menteeId?status=pending
const getMenteeRequests = async (req, res) => {
  const { menteeId } = req.params;
  const { status } = req.query;

  try {
    await flushExpired();

    const conditions = ["mr.mentee_id = $1"];
    const params     = [menteeId];

    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT
         mr.id,
         mr.status,
         mr.message,
         mr.requested_skills,
         mr.response_message,
         mr.responded_at,
         mr.expires_at,
         mr.created_at,
         -- project info
         p.id    AS project_id,
         p.title AS project_title,
         -- mentor info
         mp.id                  AS mentor_id,
         mp.title               AS mentor_title,
         mp.company             AS mentor_company,
         mp.years_of_experience,
         mp.expertise_areas,
         u.full_name            AS mentor_name,
         u.email                AS mentor_email
       FROM   mentorship_requests mr
       JOIN   projects        p  ON mr.project_id = p.id
       JOIN   mentor_profiles mp ON mr.mentor_id  = mp.id
       JOIN   users           u  ON mp.user_id    = u.id
       WHERE  ${conditions.join(" AND ")}
       ORDER  BY mr.created_at DESC`,
      params
    );

    res.json({ total: rows.length, requests: rows });

  } catch (err) {
    console.error("getMenteeRequests error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── 4. Get requests for a specific project ───────────────────────────────
// GET /api/requests/project/:projectId?status=pending
const getProjectRequests = async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.query;

  try {
    await flushExpired();

    const conditions = ["mr.project_id = $1"];
    const params     = [projectId];

    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }

    const { rows } = await pool.query(
      `SELECT
         mr.id,
         mr.status,
         mr.message,
         mr.requested_skills,
         mr.response_message,
         mr.responded_at,
         mr.expires_at,
         mr.created_at,
         -- mentor info
         mp.id                  AS mentor_id,
         mp.title               AS mentor_title,
         mp.company             AS mentor_company,
         mp.years_of_experience,
         mp.expertise_areas,
         u.full_name            AS mentor_name,
         u.email                AS mentor_email
       FROM   mentorship_requests mr
       JOIN   mentor_profiles mp ON mr.mentor_id = mp.id
       JOIN   users           u  ON mp.user_id   = u.id
       WHERE  ${conditions.join(" AND ")}
       ORDER  BY mr.created_at DESC`,
      params
    );

    res.json({ total: rows.length, requests: rows });

  } catch (err) {
    console.error("getProjectRequests error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── 5. Mentor accepts or rejects a request ───────────────────────────────
// PATCH /api/requests/:requestId
// Body: { status: 'accepted'|'rejected', mentorId, responseMessage? }
const updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status, mentorId, responseMessage } = req.body;

  if (!status)   return res.status(400).json({ error: "status is required." });
  if (!mentorId) return res.status(400).json({ error: "mentorId is required." });

  if (!["accepted", "rejected"].includes(status))
    return res.status(400).json({ error: "status must be 'accepted' or 'rejected'." });

  try {
    await flushExpired();

    // Fetch the request and verify it belongs to this mentor
    const { rows: existing } = await pool.query(
      `SELECT id, status, mentor_id, project_id
       FROM   mentorship_requests
       WHERE  id = $1`,
      [requestId]
    );

    if (!existing.length)
      return res.status(404).json({ error: "Request not found." });

    if (existing[0].mentor_id !== mentorId)
      return res.status(403).json({ error: "This request is not addressed to you." });

    if (existing[0].status !== "pending")
      return res.status(409).json({
        error: `Request has already been ${existing[0].status}.`,
      });

    const { project_id } = existing[0];

    // On accept: expire all OTHER pending requests for this project so no
    // other mentor can still respond to a stale pending request.
    if (status === "accepted") {
      await pool.query(
        `UPDATE mentorship_requests
         SET    status     = 'expired',
                updated_at = NOW()
         WHERE  project_id = $1
           AND  id        != $2
           AND  status     = 'pending'`,
        [project_id, requestId]
      );
    }

    // Update this request
    // Update this request
const { rows } = await pool.query(
  `UPDATE mentorship_requests
   SET    status           = $1,
          response_message = $2,
          responded_at     = NOW(),
          updated_at       = NOW()
   WHERE  id = $3
   RETURNING
     id,
     project_id,
     mentor_id,
     mentee_id,
     status,
     response_message,
     responded_at`,
  [status, responseMessage || null, requestId]
);

// If mentor accepted, create mentorship record
// If mentor accepted, create mentorship record
if (status === "accepted") {
  const request = rows[0];

  const { rows: mentorshipRows } = await pool.query(
    `
    INSERT INTO mentorships
    (
      id,
      mentor_id,
      mentee_id,
      request_id,
      project_id,
      status,
      start_date,
      goals_summary
    )
    VALUES
    (
      gen_random_uuid(),
      $1,
      $2,
      $3,
      $4,
      'active',
      CURRENT_DATE,
      'Mentorship started from accepted request'
    )
    RETURNING *
    `,
    [
      request.mentor_id,
      request.mentee_id,
      request.id,
      request.project_id   // ✅ added
    ]
  );

  console.log("Mentorship created:", mentorshipRows[0].id);

}

res.json({
  message: `Request ${status} successfully.`,
  request: rows[0]
});

  } catch (err) {
    console.error("updateRequestStatus error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── 6. Mentee cancels a pending request ──────────────────────────────────
// DELETE /api/requests/:requestId
// Body: { menteeId }
const cancelRequest = async (req, res) => {
  const { requestId } = req.params;
  const { menteeId } = req.body;

  if (!menteeId) return res.status(400).json({ error: "menteeId is required." });

  try {
    await flushExpired();

    const { rows: existing } = await pool.query(
      `SELECT id, status, mentee_id
       FROM   mentorship_requests
       WHERE  id = $1`,
      [requestId]
    );

    if (!existing.length)
      return res.status(404).json({ error: "Request not found." });

    if (existing[0].mentee_id !== menteeId)
      return res.status(403).json({ error: "This request does not belong to you." });

    if (existing[0].status !== "pending")
      return res.status(409).json({
        error: `Only pending requests can be cancelled. This one is already ${existing[0].status}.`,
      });

    await pool.query(
      `DELETE FROM mentorship_requests WHERE id = $1`,
      [requestId]
    );

    res.json({ message: "Request cancelled." });

  } catch (err) {
    console.error("cancelRequest error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  sendRequest,
  getMentorRequests,
  getMenteeRequests,
  getProjectRequests,
  updateRequestStatus,
  cancelRequest,
  flushExpired,
};
const pool = require("../config/db");
const supabase = require("../config/supabase");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchStats(userId) {
  const [activeMentors, goalsSet, goalsCompleted, tasksCompleted] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT mentor_id)::int AS count
         FROM mentorships
         WHERE mentee_id = $1 AND status = 'active'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM goals WHERE mentee_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM goals
         WHERE mentee_id = $1 AND status = 'completed'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
         FROM tasks t
         JOIN goals g ON g.id = t.goal_id
         WHERE g.mentee_id = $1 AND t.status = 'completed'`,
        [userId]
      ),
    ]);

  return {
    activeMentors: activeMentors.rows[0].count,
    goalsSet: goalsSet.rows[0].count,
    goalsCompleted: goalsCompleted.rows[0].count,
    tasksCompleted: tasksCompleted.rows[0].count,
  };
}

async function fetchMentors(userId) {
  const result = await pool.query(
    `
    SELECT DISTINCT
        u.id AS "mentorId",
        u.full_name AS "name",
        mp.title,
        mp.company,
        mp.rating,
        u.avatar_url AS "avatarUrl"
    FROM mentorships m
    JOIN mentor_profiles mp
        ON mp.id = m.mentor_id
    JOIN users u
        ON u.id = mp.user_id
    WHERE m.mentee_id = $1
    AND m.status = 'active'
    `,
    [userId]
  );

  return result.rows;
}


async function fetchGoals(userId) {
  const result = await pool.query(
    `SELECT
       id                                  AS "id",
       title                               AS "title",
       description                         AS "description",
       status                              AS "status",
       progress_percentage                 AS "progressPercentage",
       TO_CHAR(target_date, 'YYYY-MM-DD')  AS "targetDate"
     FROM goals
     WHERE mentee_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

// ─── API 1  GET /api/profile/me ───────────────────────────────────────────────

exports.getMyProfile = async (req, res) => {
  const userId = req.body.id;

  try {
    const [userRow, statsData, mentorsData, goalsData] = await Promise.all([
      pool.query(
        `SELECT
           u.id                   AS "id",
           u.full_name            AS "fullName",
           u.email                AS "email",
           u.avatar_url           AS "avatarUrl",
           u.bio                  AS "bio",
           u.location             AS "location",
           mp.job_role            AS "jobRole",
           mp.current_company     AS "currentCompany",
           mp.career_goals        AS "careerGoals",
           mp.linkedin_url        AS "linkedinUrl",
           mp.github_url          AS "githubUrl",
           mp.learning_objectives AS "learningObjectives"
         FROM users u
         LEFT JOIN mentee_profiles mp ON mp.user_id = u.id
         WHERE u.id = $1`,
        [userId]
      ),
      fetchStats(userId),
      fetchMentors(userId),
      fetchGoals(userId),
    ]);

    if (!userRow.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = userRow.rows[0];
    profile.learningObjectives = profile.learningObjectives ?? [];

    return res.status(200).json({
      profile,
      stats: statsData,
      mentors: mentorsData,
      goals: goalsData,
    });
  } catch (err) {
    console.error("[getMyProfile]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 2  GET /api/profile/:userId ─────────────────────────────────────────

exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const [userRow, statsData, goalsData] = await Promise.all([
      pool.query(
        `SELECT
           u.id                   AS "id",
           u.full_name            AS "fullName",
           u.email                AS "email",
           u.avatar_url           AS "avatarUrl",
           u.bio                  AS "bio",
           u.location             AS "location",
           mp.job_role            AS "jobRole",
           mp.current_company     AS "currentCompany",
           mp.career_goals        AS "careerGoals",
           mp.linkedin_url        AS "linkedinUrl",
           mp.github_url          AS "githubUrl",
           mp.learning_objectives AS "learningObjectives"
         FROM users u
         LEFT JOIN mentee_profiles mp ON mp.user_id = u.id
         WHERE u.id = $1 AND u.is_active = true`,
        [userId]
      ),
      fetchStats(userId),
      fetchGoals(userId),
    ]);

    if (!userRow.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = userRow.rows[0];
    profile.learningObjectives = profile.learningObjectives ?? [];

    return res.status(200).json({ profile, stats: statsData, goals: goalsData });
  } catch (err) {
    console.error("[getUserProfile]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 3  PUT /api/profile ──────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  const userId = req.body.id;
  const {
    fullName,
    bio,
    location,
    jobRole,
    currentCompany,
    careerGoals,
    linkedinUrl,
    githubUrl,
    learningObjectives,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE users
       SET full_name  = COALESCE($1, full_name),
           bio        = COALESCE($2, bio),
           location   = COALESCE($3, location),
           updated_at = NOW()
       WHERE id = $4`,
      [fullName, bio, location, userId]
    );

    await client.query(
      `INSERT INTO mentee_profiles
         (user_id, job_role, current_company, career_goals,
          linkedin_url, github_url, learning_objectives, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET job_role            = EXCLUDED.job_role,
             current_company     = EXCLUDED.current_company,
             career_goals        = EXCLUDED.career_goals,
             linkedin_url        = EXCLUDED.linkedin_url,
             github_url          = EXCLUDED.github_url,
             learning_objectives = EXCLUDED.learning_objectives,
             updated_at          = NOW()`,
      [
        userId,
        jobRole,
        currentCompany,
        careerGoals,
        linkedinUrl,
        githubUrl,
        JSON.stringify(learningObjectives ?? []),
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[updateProfile]", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

// ─── API 4  PATCH /api/profile/avatar ────────────────────────────────────────

exports.uploadAvatar = async (req, res) => {
  const userId = req.body.id;

  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase() || ".jpg";
    const fileName = `${userId}_${uuidv4()}${ext}`;
    const bucketPath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(bucketPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadAvatar] Supabase error:", uploadError);
      return res.status(502).json({ error: "Failed to upload image" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(bucketPath);

    const avatarUrl = publicUrlData.publicUrl;

    await pool.query(
      `UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`,
      [avatarUrl, userId]
    );

    return res.status(200).json({ success: true, avatarUrl });
  } catch (err) {
    console.error("[uploadAvatar]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 5  DELETE /api/profile/avatar ───────────────────────────────────────

exports.deleteAvatar = async (req, res) => {
  const userId = req.body.id;

  try {
    await pool.query(
      `UPDATE users SET avatar_url = NULL, updated_at = NOW() WHERE id = $1`,
      [userId]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[deleteAvatar]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 6  GET /api/profile/stats ───────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const stats = await fetchStats(req.body.id);
    return res.status(200).json(stats);
  } catch (err) {
    console.error("[getStats]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 7  GET /api/profile/mentors ─────────────────────────────────────────

exports.getMentors = async (req, res) => {
  try {
    const mentors = await fetchMentors(req.body.id);
    return res.status(200).json(mentors);
  } catch (err) {
    console.error("[getMentors]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 8  GET /api/profile/goals ───────────────────────────────────────────

exports.getGoals = async (req, res) => {
  try {
    const goals = await fetchGoals(req.body.id);
    return res.status(200).json(goals);
  } catch (err) {
    console.error("[getGoals]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── API 9  GET /api/profile/dashboard ───────────────────────────────────────

exports.getDashboard = async (req, res) => {
  const userId = req.body.id;

  try {
    const [userRow, statsData, mentorsData, goalsData] = await Promise.all([
      pool.query(
        `SELECT
           u.id                   AS "id",
           u.full_name            AS "fullName",
           u.email                AS "email",
           u.avatar_url           AS "avatarUrl",
           u.bio                  AS "bio",
           u.location             AS "location",
           mp.job_role            AS "jobRole",
           mp.current_company     AS "currentCompany",
           mp.career_goals        AS "careerGoals",
           mp.linkedin_url        AS "linkedinUrl",
           mp.github_url          AS "githubUrl",
           mp.learning_objectives AS "learningObjectives"
         FROM users u
         LEFT JOIN mentee_profiles mp ON mp.user_id = u.id
         WHERE u.id = $1`,
        [userId]
      ),
      fetchStats(userId),
      fetchMentors(userId),
      fetchGoals(userId),
    ]);

    if (!userRow.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = userRow.rows[0];
    profile.learningObjectives = profile.learningObjectives ?? [];

    return res.status(200).json({
      profile,
      stats: statsData,
      mentors: mentorsData,
      goals: goalsData,
    });
  } catch (err) {
    console.error("[getDashboard]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
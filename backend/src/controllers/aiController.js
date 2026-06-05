require("dotenv").config();
const pool = require("../config/db");
const { generateEmbedding } = require("../utils/embeddings");

// ─── 1. Generate & save mentor embedding ───────────────────────
const updateMentorEmbedding = async (req, res) => {
  const { mentor_id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT id, profile_summary FROM mentor_profiles WHERE id = $1`,
      [mentor_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const mentor = rows[0];

    if (!mentor.profile_summary) {
      return res.status(400).json({ error: "Mentor has no profile summary" });
    }

    const embedding = await generateEmbedding(mentor.profile_summary);
    console.log("Embedding dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));

    await pool.query(
      `UPDATE mentor_profiles 
       SET embedding = $1::vector, 
           embedding_updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(embedding), mentor_id]
    );

    res.json({ message: "Embedding updated successfully", mentor_id });

  } catch (err) {
    console.error("Embedding error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ─── 2. Get mentor recommendations for a project ───────────────
// Called when mentee clicks a project and wants to see matching mentors
// GET /api/projects/:projectId/recommendations
const getProjectRecommendations = async (req, res) => {
  const { projectId } = req.params;
  const threshold = parseFloat(req.query.threshold) || 0.6;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // ── Fetch project embedding from DB ──────────────────────────
    const { rows: projectRows } = await pool.query(
      `SELECT id, title, embedding FROM projects WHERE id = $1`,
      [projectId]
    );

    if (!projectRows.length) {
      return res.status(404).json({ error: "Project not found." });
    }

    const project = projectRows[0];

    if (!project.embedding) {
      return res.status(422).json({ error: "Project has no embedding yet." });
    }

    // ── Compare against mentor embeddings ────────────────────────
    const { rows: mentors } = await pool.query(
      `SELECT
         mp.id                                          AS mentor_id,
         mp.user_id,
         mp.title,
         mp.company,
         mp.years_of_experience,
         mp.expertise_areas,
         mp.profile_summary,
         1 - (mp.embedding <=> $1::vector)             AS similarity_score
       FROM mentor_profiles mp
       WHERE mp.embedding IS NOT NULL
         AND 1 - (mp.embedding <=> $1::vector) >= $2
       ORDER BY mp.embedding <=> $1::vector
       LIMIT $3`,
      [project.embedding, threshold, limit]
    );

    res.json({
      projectId,
      projectTitle: project.title,
      total: mentors.length,
      mentors,
    });

  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { updateMentorEmbedding, getProjectRecommendations };
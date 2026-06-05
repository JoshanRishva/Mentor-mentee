require("dotenv").config();
const pool = require("../config/db");
const { generateEmbedding } = require("../utils/embeddings");
const { generateProjectSummary } = require("../utils/aiSummary");

const createProjectHandler = async (req, res) => {
  const { menteeId, title, description, requiredSkills } = req.body;

  // ── Validation ────────────────────────────────────────────────
  if (!menteeId)
    return res.status(400).json({ error: "menteeId is required." });
  if (!title || !title.trim())
    return res.status(400).json({ error: "title is required." });
  if (!description || !description.trim())
    return res.status(400).json({ error: "description is required." });
  if (!Array.isArray(requiredSkills) || requiredSkills.length === 0)
    return res.status(400).json({ error: "requiredSkills must be a non-empty array." });

  try {
    // ── Step 1: Generate AI project summary ──────────────────────
    const projectSummary = await generateProjectSummary({
      title,
      description,
      requiredSkills,
    });

    // ── Step 2: Build embedding text (summary + skills) ──────────
    const embeddingText = `${projectSummary}\nRequired skills: ${requiredSkills.join(", ")}`;

    // ── Step 3: Generate embedding ────────────────────────────────
    const embedding = await generateEmbedding(embeddingText);
    console.log("Project embedding dimensions:", embedding.length);
    console.log("First 5 values:", embedding.slice(0, 5));

    // ── Step 4: Save to DB ────────────────────────────────────────
    const { rows } = await pool.query(
      `INSERT INTO projects
        (mentee_id, title, description, required_skills, project_summary, embedding, embedding_updated_at, status)
       VALUES
        ($1, $2, $3, $4, $5, $6::vector, NOW(), 'active')
       RETURNING
        id, mentee_id, title, description, required_skills,
        project_summary, status, embedding_updated_at, created_at, updated_at`,
      [
        menteeId,
        title.trim(),
        description.trim(),
        requiredSkills,
        projectSummary,
        JSON.stringify(embedding), // same pattern as updateMentorEmbedding
      ]
    );

    res.status(201).json({
      message: "Project created successfully.",
      project: rows[0],
    });

  } catch (err) {
    console.error("Project creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createProjectHandler };
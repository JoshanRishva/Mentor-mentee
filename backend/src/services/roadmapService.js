const pool    = require("../config/db");
const { generateJSON }        = require("../utils/gemini");
const { buildRoadmapPrompt }  = require("../utils/roadmapPrompt");
const { buildProjectRoadmapPrompt } = require("../utils/projectRoadmapPrompt");

// ── helpers ───────────────────────────────────────────────────────────────────

async function archiveRoadmapById(client, roadmapId) {
  await client.query(
    `UPDATE ai_roadmaps SET status = 'archived', updated_at = NOW() WHERE id = $1`,
    [roadmapId]
  );
}

async function insertHierarchy(client, roadmapId, phases) {
  let phaseCount = 0;

  for (let pi = 0; pi < phases.length; pi++) {
    const ph = phases[pi];
    phaseCount++;

    const { rows: [phase] } = await client.query(
      `INSERT INTO ai_roadmap_phases
         (roadmap_id, phase_number, title, description, duration_weeks, order_index)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [roadmapId, ph.phase_number || pi + 1, ph.title, ph.description,
       ph.duration_weeks || 1, pi]
    );

    for (let mi = 0; mi < (ph.milestones || []).length; mi++) {
      const ms = ph.milestones[mi];

      const { rows: [milestone] } = await client.query(
        `INSERT INTO ai_roadmap_milestones
           (phase_id, roadmap_id, title, description, outcome, order_index)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [phase.id, roadmapId, ms.title, ms.description, ms.outcome || null, mi]
      );

      for (let ti = 0; ti < (ms.tasks || []).length; ti++) {
        const tk = ms.tasks[ti];
        const validTypes = ['read','watch','practice','build','quiz'];
        const task_type  = validTypes.includes(tk.task_type) ? tk.task_type : 'read';

        await client.query(
          `INSERT INTO ai_roadmap_tasks
             (milestone_id, roadmap_id, title, description, task_type,
              resource_url, estimated_hours, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [milestone.id, roadmapId, tk.title, tk.description, task_type,
           tk.resource_url || null, tk.estimated_hours || 0, ti]
        );
      }
    }
  }

  return phaseCount;
}

// ── generate ──────────────────────────────────────────────────────────────────

async function generate(body) {
  const {
    user_id, project_id = null,
    target_role, experience_level,
    current_skills = [], preferred_techs = [],
    weekly_hours, duration_weeks, additional_notes = ""
  } = body;

  // fetch project context if linked
  let project = null;

if (project_id) {

  const { rows } = await pool.query(
    `
    SELECT
      title,
      description,
      required_skills
    FROM projects
    WHERE id = $1
    `,
    [project_id]
  );

  if (!rows.length) {
    throw new Error("Project not found");
  }

  project = rows[0];
}
let prompt;

if (project_id) {

  prompt = buildProjectRoadmapPrompt({
    project_title: project.title,
    project_description: project.description,
    required_skills: project.required_skills || [],
    weekly_hours,
    duration_weeks
  });

} else {

  if (!target_role) {
    throw new Error("target_role is required");
  }

  if (!experience_level) {
    throw new Error("experience_level is required");
  }

  prompt = buildRoadmapPrompt({
    target_role,
    experience_level,
    current_skills,
    preferred_techs,
    weekly_hours,
    duration_weeks,
    additional_notes
  });

}

const ai = await generateJSON(prompt);

  // transaction: archive existing active (project-linked) + insert new
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // archive any existing active roadmap for this project
    if (project_id) {
      const { rows: existing } = await client.query(
        `SELECT id FROM ai_roadmaps
         WHERE project_id = $1 AND status = 'active'`,
        [project_id]
      );
      if (existing.length) {
        await archiveRoadmapById(client, existing[0].id);
      }
    }

    // insert roadmap row
    const { rows: [roadmap] } = await client.query(
      `INSERT INTO ai_roadmaps
         (user_id, project_id, target_role, experience_level, current_skills,
          preferred_techs, weekly_hours, duration_weeks, additional_notes,
          title, summary, estimated_weeks, raw_ai_response, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'active')
       RETURNING *`,
      [
        user_id, project_id, target_role, experience_level,
        current_skills, preferred_techs, weekly_hours, duration_weeks,
        additional_notes, ai.title, ai.summary, ai.estimated_weeks,
        JSON.stringify(ai),
      ]
    );

    // insert phases → milestones → tasks
    const phaseCount = await insertHierarchy(client, roadmap.id, ai.phases || []);

    // update total_phases
    await client.query(
      `UPDATE ai_roadmaps SET total_phases = $1 WHERE id = $2`,
      [phaseCount, roadmap.id]
    );

    await client.query("COMMIT");
    return { ...roadmap, total_phases: phaseCount };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── list ──────────────────────────────────────────────────────────────────────

async function list({ user_id, project_id, status }) {
  const conditions = [];
  const values     = [];

  if (user_id) {
    conditions.push(`r.user_id = $${values.length + 1}`);
    values.push(user_id);
  }
  if (project_id) {
    conditions.push(`r.project_id = $${values.length + 1}`);
    values.push(project_id);
  }
  if (status) {
    conditions.push(`r.status = $${values.length + 1}`);
    values.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT r.*, 
            COALESCE(p.overall_pct, 0)        AS overall_pct,
            COALESCE(p.completed_tasks, 0)    AS completed_tasks,
            COALESCE(p.total_tasks, 0)        AS total_tasks
     FROM ai_roadmaps r
     LEFT JOIN ai_roadmap_progress p ON p.roadmap_id = r.id
     ${where}
     ORDER BY r.created_at DESC`,
    values
  );

  return rows;
}

// ── getById ───────────────────────────────────────────────────────────────────

async function getById(id) {
  const { rows: [roadmap] } = await pool.query(
    `SELECT r.*,
            COALESCE(p.overall_pct, 0)     AS overall_pct,
            COALESCE(p.total_tasks, 0)     AS total_tasks,
            COALESCE(p.completed_tasks, 0) AS completed_tasks
     FROM ai_roadmaps r
     LEFT JOIN ai_roadmap_progress p ON p.roadmap_id = r.id
     WHERE r.id = $1`,
    [id]
  );
  if (!roadmap) return null;

  // fetch phases
  const { rows: phases } = await pool.query(
    `SELECT * FROM ai_roadmap_phases WHERE roadmap_id = $1 ORDER BY order_index`,
    [id]
  );

  // fetch milestones
  const { rows: milestones } = await pool.query(
    `SELECT * FROM ai_roadmap_milestones WHERE roadmap_id = $1 ORDER BY order_index`,
    [id]
  );

  // fetch tasks
  const { rows: tasks } = await pool.query(
    `SELECT * FROM ai_roadmap_tasks WHERE roadmap_id = $1 ORDER BY order_index`,
    [id]
  );

  // assemble hierarchy
  const tasksByMilestone = {};
  for (const t of tasks) {
    if (!tasksByMilestone[t.milestone_id]) tasksByMilestone[t.milestone_id] = [];
    tasksByMilestone[t.milestone_id].push(t);
  }

  const milestonesByPhase = {};
  for (const m of milestones) {
    if (!milestonesByPhase[m.phase_id]) milestonesByPhase[m.phase_id] = [];
    milestonesByPhase[m.phase_id].push({
      ...m,
      tasks: tasksByMilestone[m.id] || [],
    });
  }

  roadmap.phases = phases.map(ph => ({
    ...ph,
    milestones: milestonesByPhase[ph.id] || [],
  }));

  return roadmap;
}

// ── update ────────────────────────────────────────────────────────────────────

async function update(id, { title, additional_notes }) {
  const { rows: [roadmap] } = await pool.query(
    `UPDATE ai_roadmaps
     SET title            = COALESCE($1, title),
         additional_notes = COALESCE($2, additional_notes),
         updated_at       = NOW()
     WHERE id = $3
     RETURNING *`,
    [title, additional_notes, id]
  );
  return roadmap || null;
}

// ── archive ───────────────────────────────────────────────────────────────────

async function archive(id) {
  await pool.query(
    `UPDATE ai_roadmaps SET status = 'archived', updated_at = NOW() WHERE id = $1`,
    [id]
  );
}

// ── regenerate ────────────────────────────────────────────────────────────────

async function regenerate(id, body) {
  const { rows: [existing] } = await pool.query(
    `SELECT * FROM ai_roadmaps WHERE id = $1`,
    [id]
  );
  if (!existing) throw new Error("Roadmap not found");
  if (existing.status !== "active") throw new Error("Only active roadmaps can be regenerated");

  // generate new roadmap with same inputs (allow overrides from body)
  const newRoadmap = await generate({
    user_id:          existing.user_id,
    project_id:       existing.project_id,
    target_role:      body.target_role      || existing.target_role,
    experience_level: body.experience_level || existing.experience_level,
    current_skills:   body.current_skills   || existing.current_skills,
    preferred_techs:  body.preferred_techs  || existing.preferred_techs,
    weekly_hours:     body.weekly_hours     || existing.weekly_hours,
    duration_weeks:   body.duration_weeks   || existing.duration_weeks,
    additional_notes: body.additional_notes || existing.additional_notes,
  });

  // link version chain + version number
  await pool.query(
    `UPDATE ai_roadmaps
     SET parent_roadmap_id = $1,
         version           = $2
     WHERE id = $3`,
    [id, (existing.version || 1) + 1, newRoadmap.id]
  );

  // archive old
  await archive(id);

  return newRoadmap;
}

// ── restore ───────────────────────────────────────────────────────────────────

async function restore(id) {
  const { rows: [target] } = await pool.query(
    `SELECT * FROM ai_roadmaps WHERE id = $1`,
    [id]
  );
  if (!target) throw new Error("Roadmap not found");
  if (target.status !== "archived") throw new Error("Only archived roadmaps can be restored");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // archive current active (project-linked)
    if (target.project_id) {
      const { rows: active } = await client.query(
        `SELECT id FROM ai_roadmaps
         WHERE project_id = $1 AND status = 'active'`,
        [target.project_id]
      );
      if (active.length) {
        await archiveRoadmapById(client, active[0].id);
      }
    }

    // restore target
    const { rows: [restored] } = await client.query(
      `UPDATE ai_roadmaps
       SET status = 'active', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await client.query("COMMIT");
    return restored;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ── toggleTask ────────────────────────────────────────────────────────────────

async function toggleTask(taskId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // toggle task
    const { rows: [task] } = await client.query(
      `UPDATE ai_roadmap_tasks
       SET is_completed = NOT is_completed,
           completed_at = CASE WHEN NOT is_completed THEN NOW() ELSE NULL END
       WHERE id = $1
       RETURNING *`,
      [taskId]
    );
    if (!task) throw new Error("Task not found");

    // refresh milestone status
    const { rows: milestoneTasks } = await client.query(
      `SELECT is_completed FROM ai_roadmap_tasks WHERE milestone_id = $1`,
      [task.milestone_id]
    );
    const allTasksDone  = milestoneTasks.every(t => t.is_completed);
    const anyTaskDone   = milestoneTasks.some(t => t.is_completed);
    const milestoneStatus = allTasksDone ? 'completed'
                          : anyTaskDone  ? 'in_progress'
                          :                'not_started';

    await client.query(
      `UPDATE ai_roadmap_milestones
       SET status       = $1,
           completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
       WHERE id = $2`,
      [milestoneStatus, task.milestone_id]
    );

    // refresh phase status
    const { rows: [milestone] } = await client.query(
      `SELECT phase_id FROM ai_roadmap_milestones WHERE id = $1`,
      [task.milestone_id]
    );

    const { rows: phaseMilestones } = await client.query(
      `SELECT status FROM ai_roadmap_milestones WHERE phase_id = $1`,
      [milestone.phase_id]
    );
    const allMsDone  = phaseMilestones.every(m => m.status === 'completed');
    const anyMsDone  = phaseMilestones.some(m => m.status !== 'not_started');
    const phaseStatus = allMsDone ? 'completed'
                      : anyMsDone ? 'in_progress'
                      :              'not_started';

    await client.query(
      `UPDATE ai_roadmap_phases SET status = $1 WHERE id = $2`,
      [phaseStatus, milestone.phase_id]
    );

    await client.query("COMMIT");
    return { task, milestoneStatus, phaseStatus };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function listProjectRoadmaps(projectId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM ai_roadmaps
    WHERE project_id = $1
    ORDER BY version DESC
    `,
    [projectId]
  );

  return rows;
}

module.exports = {
  generate, list, getById, update,
  archive, regenerate, restore, toggleTask,listProjectRoadmaps,
};
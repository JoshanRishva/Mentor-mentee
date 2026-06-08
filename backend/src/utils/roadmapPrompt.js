function buildRoadmapPrompt({ target_role, experience_level, current_skills,
  preferred_techs, weekly_hours, duration_weeks, additional_notes,
  project_title, project_description }) {

  const projectBlock = project_title
    ? `Project Context:\n- Title: ${project_title}\n- Description: ${project_description || "N/A"}`
    : "";

  return `
You are an expert technical mentor. Generate a detailed personalized learning roadmap.

User Details:
- Target Role: ${target_role}
- Experience Level: ${experience_level}
- Current Skills: ${(current_skills || []).join(", ") || "None"}
- Preferred Technologies: ${(preferred_techs || []).join(", ") || "None"}
- Weekly Study Hours: ${weekly_hours}
- Duration: ${duration_weeks} weeks
- Additional Notes: ${additional_notes || "None"}
${projectBlock}

Return ONLY a valid JSON object with NO markdown, NO explanation, JUST JSON.

Required structure:
{
  "title": "string — roadmap title",
  "summary": "string — 2-3 sentence overview",
  "estimated_weeks": number,
  "phases": [
    {
      "phase_number": number,
      "title": "string",
      "description": "string",
      "duration_weeks": number,
      "milestones": [
        {
          "title": "string",
          "description": "string",
          "outcome": "string — what the learner can do after this",
          "tasks": [
            {
              "title": "string",
              "description": "string",
              "task_type": "read|watch|practice|build|quiz",
              "resource_url": "string or null",
              "estimated_hours": number
            }
          ]
        }
      ]
    }
  ]
}
`.trim();
}

module.exports = { buildRoadmapPrompt };
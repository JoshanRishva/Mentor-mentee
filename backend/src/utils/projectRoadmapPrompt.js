function buildProjectRoadmapPrompt({
  project_title,
  project_description,
  required_skills = [],
  weekly_hours,
  duration_weeks
}) {
  return `
You are an expert technical mentor.

Generate a detailed project learning roadmap.

Project Details:
- Title: ${project_title}
- Description: ${project_description || "N/A"}
- Required Skills: ${required_skills.join(", ") || "None"}
- Weekly Study Hours: ${weekly_hours}
- Duration: ${duration_weeks} weeks

The roadmap should focus ONLY on skills and knowledge required to successfully complete this project.

Return ONLY valid JSON.

{
  "title": "string",
  "summary": "string",
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
          "outcome": "string",
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

module.exports = { buildProjectRoadmapPrompt };
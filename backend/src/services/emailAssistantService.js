const { GoogleGenerativeAI } = require('@google/generative-ai');
const EMAIL_TEMPLATES = require('../config/emailTemplates');
const  pool  = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt({ template, tone, additionalContext, requiredFields, optionalFields, customFields }) {
  const lines = [];

  lines.push(`Email Template:\n${template.displayName}`);
  lines.push(`\nTone:\n${tone}`);

  if (additionalContext) {
    lines.push(`\nAdditional Context:\n${additionalContext}`);
  }

  lines.push('\nRequired Information:');
  for (const field of template.requiredFields) {
    const val = requiredFields[field.key];
    if (val) lines.push(`\n${field.label}:\n${val}`);
  }

  const hasOptional = optionalFields && Object.keys(optionalFields).length > 0;
  if (hasOptional) {
    lines.push('\nOptional Information:');
    for (const field of template.optionalFields) {
      const val = optionalFields[field.key];
      if (val) lines.push(`\n${field.label}:\n${val}`);
    }
  }

  if (customFields && customFields.length > 0) {
    lines.push('\nAdditional Custom Information:');
    for (const cf of customFields) {
      lines.push(`\n${cf.label}:\n${cf.value}`);
    }
  }

  lines.push(`
Generate:
1. Subject
2. Email Body

Return valid JSON only, no markdown, no backticks:
{"subject":"","content":""}`);

  return lines.join('');
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(userPrompt) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
systemInstruction:
  'You are an expert professional email writing assistant. ' +
  'Generate concise, human-like, professional emails. ' +
  'For salutations, always use "Dear Mr./Ms./Dr. [Last Name]," format — never use full name directly. ' +
  'Adapt the writing style based on email type, tone, and context. ' +
  'Never invent facts. ' +
  'Return valid JSON only with keys "subject" and "content". No markdown fences.',
  });

  const result = await model.generateContent(userPrompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned malformed JSON: ' + cleaned.slice(0, 200));
  }

  if (!parsed.subject || !parsed.content) {
    throw new Error('Gemini response missing subject or content fields');
  }

  return { subject: parsed.subject, content: parsed.content };
}

// ─── DB queries ───────────────────────────────────────────────────────────────

async function saveEmail({ userId, templateId, tone, generationInput, subject, content }) {
  const result = await pool.query(
    `INSERT INTO email_history
       (user_id, template_id, tone, generation_input, generated_subject, generated_content)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, template_id, generated_subject, created_at`,
    [userId, templateId, tone, JSON.stringify(generationInput), subject, content]
  );
  return result.rows[0];
}

async function getHistoryByUser(userId) {
  const result = await pool.query(
    `SELECT id, template_id, generated_subject, created_at
     FROM email_history
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getEmailById(id) {
  const result = await pool.query(
    `SELECT id, user_id, template_id, tone, generation_input,
            generated_subject, generated_content, created_at
     FROM email_history
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function deleteEmailById(id, userId) {
  const result = await pool.query(
    `DELETE FROM email_history
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

// ─── Public functions ─────────────────────────────────────────────────────────

function getAllTemplates() {
  return Object.values(EMAIL_TEMPLATES).map(({ id, displayName, description }) => ({
    id,
    displayName,
    description,
  }));
}

function getTemplateById(templateId) {
  return EMAIL_TEMPLATES[templateId] || null;
}

async function generateEmail(userId, body) {
  const { templateId, tone, additionalContext, requiredFields, optionalFields, customFields } = body;

  const template = EMAIL_TEMPLATES[templateId];

  const prompt = buildPrompt({
    template,
    tone: tone.trim(),
    additionalContext,
    requiredFields,
    optionalFields: optionalFields || {},
    customFields: customFields || [],
  });

  const { subject, content } = await callGemini(prompt);

  const generationInput = {
    templateId,
    tone,
    additionalContext: additionalContext || null,
    requiredFields,
    optionalFields: optionalFields || {},
    customFields: customFields || [],
  };

  const saved = await saveEmail({ userId, templateId, tone, generationInput, subject, content });

  return {
    id: saved.id,
    templateId: saved.template_id,
    subject,
    content,
    createdAt: saved.created_at,
  };
}

async function getHistory(userId) {
  const rows = await getHistoryByUser(userId);
  return rows.map((r) => ({
    id: r.id,
    templateId: r.template_id,
    subject: r.generated_subject,
    createdAt: r.created_at,
  }));
}

async function getEmailByIdService(id) {
  const row = await getEmailById(id);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    templateId: row.template_id,
    tone: row.tone,
    generationInput: row.generation_input,
    subject: row.generated_subject,
    content: row.generated_content,
    createdAt: row.created_at,
  };
}

async function deleteEmail(id, userId) {
  const deleted = await deleteEmailById(id, userId);
  return !!deleted;
}

module.exports = {
  getAllTemplates,
  getTemplateById,
  generateEmail,
  getHistory,
  getEmailById: getEmailByIdService,
  deleteEmail,
};
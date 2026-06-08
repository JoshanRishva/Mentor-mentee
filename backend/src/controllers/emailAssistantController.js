const service = require('../services/emailAssistantService');

// TODO: replace with req.user.id once auth is wired up
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/email-assistant/templates
async function getTemplates(req, res) {
  try {
    const templates = service.getAllTemplates();
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('[EmailAssistant] getTemplates error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// GET /api/email-assistant/templates/:templateId
async function getTemplateById(req, res) {
  try {
    const { templateId } = req.params;
    const template = service.getTemplateById(templateId);

    if (!template) {
      return res.status(404).json({ success: false, message: `Template '${templateId}' not found` });
    }

    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    console.error('[EmailAssistant] getTemplateById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// POST /api/email-assistant/generate
async function generateEmail(req, res) {
  try {
    const userId = TEST_USER_ID;
    const result = await service.generateEmail(userId, req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('[EmailAssistant] generateEmail error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate email' });
  }
}

// GET /api/email-assistant/history
async function getHistory(req, res) {
  try {
    const history = await service.getHistory(TEST_USER_ID);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('[EmailAssistant] getHistory error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// GET /api/email-assistant/:id
async function getEmailById(req, res) {
  try {
    const { id } = req.params;
    const email = await service.getEmailById(id);

    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    return res.status(200).json({ success: true, data: email });
  } catch (error) {
    console.error('[EmailAssistant] getEmailById error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// DELETE /api/email-assistant/:id
async function deleteEmail(req, res) {
  try {
    const { id } = req.params;
    const deleted = await service.deleteEmail(id, TEST_USER_ID);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    return res.status(200).json({ success: true, message: 'Email deleted successfully' });
  } catch (error) {
    console.error('[EmailAssistant] deleteEmail error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getTemplates,
  getTemplateById,
  generateEmail,
  getHistory,
  getEmailById,
  deleteEmail,
};
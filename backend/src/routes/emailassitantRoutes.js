const express = require('express');
const router = express.Router();
const controller = require('../controllers/emailAssistantController');

router.get('/templates',             controller.getTemplates);
router.get('/templates/:templateId', controller.getTemplateById);
router.post('/generate',             controller.generateEmail);
router.get('/history',               controller.getHistory);
router.get('/:id',                   controller.getEmailById);
router.delete('/:id',                controller.deleteEmail);

module.exports = router;
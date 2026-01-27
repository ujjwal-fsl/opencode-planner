const express = require('express');
const RevisionController = require('../controllers/revision.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const { validateScheduleRevision } = require('../middleware/revisionValidation');

const router = express.Router();

router.use(protectedRoutes);

// Main endpoints
router.post('/schedule', validateScheduleRevision, RevisionController.scheduleRevision);
router.get('/slots', RevisionController.getRevisionSlots);
router.get('/slots/pending', RevisionController.getPendingSlots);
router.post('/complete/:slotId', RevisionController.completeRevision);

// Stats endpoint
router.get('/stats', RevisionController.getRevisionStats);

module.exports = router;
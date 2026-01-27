const express = require('express');
const RedoController = require('../controllers/redo.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const { validateRedoAttempt, validateRedoId } = require('../middleware/redoValidation');

const router = express.Router();

router.use(protectedRoutes);

router.get('/schedule', RedoController.getRedoSchedule);

router.post('/attempt', validateRedoAttempt, validateRedoId, RedoController.createRedoAttempt);

router.get('/attempts', RedoController.getRedoAttempts);

module.exports = router;
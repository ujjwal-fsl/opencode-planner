const express = require('express');
const MistakeController = require('../controllers/mistake.controller');
const { protectedRoutes } = require('../middleware/protectedRoutes');
const { 
  validateCreateMistake, 
  validateUpdateMistake, 
  validateMistakeId 
} = require('../middleware/mistakeValidation');

const router = express.Router();

router.use(protectedRoutes);

router.get('/', MistakeController.getMistakes);

router.get('/:id', validateMistakeId, MistakeController.getMistakeById);

router.post('/', validateCreateMistake, MistakeController.createMistake);

router.put('/:id', validateMistakeId, validateUpdateMistake, MistakeController.updateMistake);

router.delete('/:id', validateMistakeId, MistakeController.deleteMistake);

module.exports = router;
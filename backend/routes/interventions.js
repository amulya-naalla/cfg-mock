const express = require('express');
const {
  createIntervention,
  getInterventions,
  updateIntervention,
} = require('../controllers/interventionController');

const router = express.Router();

router.post('/', createIntervention);
router.get('/', getInterventions);
router.patch('/:id', updateIntervention);

module.exports = router;

const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/:studentId', resultsController.getResultByStudentId);

module.exports = router;

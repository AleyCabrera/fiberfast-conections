// src/routes/planes.routes.js
const express = require('express');
const router = express.Router();
const planesController = require('../controllers/planes.controller');

router.get('/', planesController.getAll);
router.get('/tipo/:tipo', planesController.getByType);
router.get('/:id', planesController.getById);

module.exports = router;
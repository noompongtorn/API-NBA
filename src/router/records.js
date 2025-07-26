const express = require('express');
const axios = require('axios')
const { pool } = require('../config/db');
const router = express.Router();
const service = require('../config/service/records-service');
const { authenticate } = require('../config/middleware');

// History-specific routes
router.get('/records', authenticate, service.records);
router.get('/:id', authenticate, service.detail);

module.exports = router;

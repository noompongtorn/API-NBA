const express = require('express');
const router = express.Router();
const service = require('../config/service/user-service')

router.get('/users', service.users);

router.get('/:id', service.profile);

module.exports = router;

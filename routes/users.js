var express = require('express');
var router = express.Router();

router.post('/createuser', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/auth', function (req, res, next) {
    
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/works', function (req, res, next) {
   res.send('this should work.');
});

module.exports = router;

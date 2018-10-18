var express = require('express');
var router = express.Router();

// Get homepage
router.get('/', (req, res) => {
  res.send("hello world");
})

module.exports = router;

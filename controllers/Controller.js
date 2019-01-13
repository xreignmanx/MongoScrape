var express = require("express");

var router = express.Router();

// Import the model (index).js) to use its database functions.
var news = require("../models/index.js");

// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
  article.all(function(data) {
    var hbsObject = {
      Article: title,
      Article: link
    };
    console.log(hbsObject);
    res.render("index", hbsObject);
  });
});





// Export routes for server.js to use.
module.exports = router;



// Dependencies - Express/Hanlebars
var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require("mongoose");
var bodyParser = require("body-parser")
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/FoxDb";


// Initialize Express
var app = express();

app.use("/public", express.static("public"));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// Dependencies - mongojs, axios and cheerio
// These make the scraping possible



// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(MONGODB_URI, {
  useNongoClient: true,
});

mongoose.Promise = global.Promise;
var dbConn = mongoose.connection;

// Check for DB errors check for Mongoose connection


// Database configuration
var databaseUrl = "FoxDb";
var collections = ["newsData"];

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/FoxDb", { useNewUrlParser: true });

// Controller folder .js (Routes)

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Build scrape route to website
app.get("/newsData", function(req, res) {
  axios.get("https://www.foxnews.com").then(function(response) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(response.data);
  var results = [];

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("article").each(function(i, element) {

    var title = $(element).children().text();
    var link = $(element).find("a").attr("href");

    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      link: link
    });
    db.newsData.insert(results)

  });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
});

// db.scrape.create(result)
// .then(function(dbArticle) {
//   // View the added result in the console
//   console.log(dbscrape);
// })
// .catch(function(err) {
//   // If an error occurred, log it
//   console.log(err);
// });



// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
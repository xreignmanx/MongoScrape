

// Dependencies - Express/Hanlebars
var express = require('express');
var exphbs  = require('express-handlebars');
var mongoose = require("mongoose");
var bodyParser = require("body-parser")
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/Articledb";


// Initialize Express
var app = express();
// Serve static content for the app from the "public" directory in the application directory.
app.use("/public", express.static("public"));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// Dependencies - mongojs, axios and cheerio
// These make the scraping possible
// Import routes and give the server access to them.
var routes = require("./controllers/Controller.js");

app.use(routes);


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
// var databaseUrl = "FoxDb";
// var collections = ["newsData"];

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/Articledb", { useNewUrlParser: true });

// Controller folder .js (Routes)

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Main route (simple Hello World Message)
// app.get("/", function(req, res) {
//   res.send("Hello world");
// });

// Build scrape route to website
app.get("/scrape", function(req, res) {
  axios.get("https://www.foxnews.com").then(function(response) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(response.data);

  // Select each element in the HTML body from which you want information.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors,
  // but be sure to visit the package's npm page to see how it works
  $("article").each(function(i, element) {
//  Save an empty result object
    var results = {};
    // Add text and href of links and save
    result.title = $(this).children("a").text();
    result.link = $(this).children("a").attr("href");
//  Create a new collection for the 'result' object
    db.Article.create(result)
      .then(function(dbArticle) {
        console.log(dbArticle);
      })
      .catch(function(err) {
        console.log(err);
      });
  });
  // Send message once scrape is complete
  res.send("Scrape Complete");
});

});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
var router = require('express').Router(),
  models = require('../../models');

// models
var Activity = models.Activity,
  Day = models.Day,
  Hotel = models.Hotel,
  Restaurant = models.Restaurant;

var matchModel = {
  activities: Activity,
  hotels: Hotel,
  restaurants: Restaurant
}

router.get('/', function(req, res, next) {
  console.log("GOT TO API DAYS ROUTE")
  Day.find()
  .then(function(days) {
    res.send(days)
  })
})

router.get('/:number/', function(req, res, next) {
  Day.find( {number : req.params.number})
  .then(function(day) {
    res.send(day)
  })
})

router.post('/:id/:model', function(req, res, next) {
  var model = matchModel[req.params.model];
  Day.findById(req.params.id)
  .then(function(day) {
    res.send("HELLO!")
  })
})

router.post('/', function(req, res, next) {
  var body = req.body;
  Day.create(body)
  res.send(body);
})



module.exports = router;

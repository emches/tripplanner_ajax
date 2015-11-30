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
  console.log('POSTED');
  var model = matchModel[req.params.model];

  model.findOne( { name: req.body.name })
  .then(function(section) {
    if (model === Hotel) {
      var update = {hotel: section._id}
    }
    else {
      var update = {$push: {}};
      update['$push'][req.params.model] = section._id;
    }
    console.log("UPDATE: ", update, "--- END UPDATE ---");

    Day.findByIdAndUpdate(req.params.id, update, {new: true}).exec()
    .then(function(updatedDay) {
      console.log(updatedDay);
      res.json(section);
    }, console.error)
  })
})

router.post('/create', function(req, res, next) {
  var body = req.body;
  var day = Day.create(body)
  res.json(day);
})



module.exports = router;

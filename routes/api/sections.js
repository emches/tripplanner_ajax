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

router.post('/:model', function(req, res, next) {
  var model = matchModel[req.params.model];
  model.findOne({ name: req.body.name })
  .then(function(place) {
    res.send(place)
  })
})


module.exports = router;

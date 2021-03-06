$(function () {

    var map = initialize_gmaps();

    var days = [


    ];

    var currentDay = 1;

    var placeMapIcons = {
        activities: '/images/star-3.png',
        restaurants: '/images/restaurant.png',
        hotels: '/images/lodging_0star.png'
    };

    var $dayButtons = $('.day-buttons');
    var $addDayButton = $('.add-day');
    var $placeLists = $('.list-group');
    var $dayTitle = $('#day-title');
    var $addPlaceButton = $('.add-place-button');


    $.get( 'api/days/')
    .done(function(mydays){
        console.log("populated days", mydays)
        var numDays = mydays.length;
        for ( var i = 1 ; i <= numDays ; i++ ) {
            var $newDayButton = createDayButton(i);
            $addDayButton.before($newDayButton);
            days.push([mydays[i-1]]);
            // setDay(1);
        }

    });


    var createItineraryItem = function (placeName) {

        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');

        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        return $item;

    };

    var setDayButtons = function () {
        $dayButtons.find('button').not('.add-day').remove();
        days.forEach(function (day, index) {
            $addDayButton.before(createDayButton(index + 1));
        });
    };

    var getPlaceObject = function (typeOfPlace, nameOfPlace) {

        var placeCollection = window['all_' + typeOfPlace];

        return placeCollection.filter(function (place) {
            return place.name === nameOfPlace;
        })[0];

    };

    var getIndexOfPlace = function (nameOfPlace, collection) {
        var i = 0;
        for (; i < collection.length; i++) {
            if (collection[i].place.name === nameOfPlace) {
                return i;
            }
        }
        return -1;
    };

    var createDayButton = function (dayNum) {
        return $('<button class="btn btn-circle day-btn"></button>').text(dayNum);
    };

    var reset = function () {

        var dayPlaces = days[currentDay - 1];
        if (!dayPlaces) return;

        $placeLists.empty();

        console.log(dayPlaces);
        dayPlaces.forEach(function (place) {
            place.marker.setMap(null);
        });

    };

    var removeDay = function (dayNum) {

        if (days.length === 1) return;

        reset();

        days.splice(dayNum - 1, 1);

        setDayButtons();
        setDay(1);

    };

    var mapFit = function () {

        var bounds = new google.maps.LatLngBounds();
        var currentPlaces = days[currentDay - 1];
        console.log(currentPlaces);
        currentPlaces.forEach(function (place) {
           // debugger;
            bounds.extend(place.marker.position);
        });

        map.fitBounds(bounds);

    };

    var setDay = function (dayNum) {

        if (dayNum > days.length || dayNum < 0) {
            return;
        }

        var placesForThisDay = days[dayNum - 1];
        var $dayButtons = $('.day-btn').not('.add-day');

        reset();

        currentDay = dayNum;

        placesForThisDay.forEach(function (place) {
            $('#' + place.section + '-list').find('ul').append(createItineraryItem(place.place.name));
            place.marker.setMap(map);
        });

        $dayButtons.removeClass('current-day');
        $dayButtons.eq(dayNum - 1).addClass('current-day');

        $dayTitle.children('span').text('Day ' + dayNum.toString());

        mapFit();

    };

    $addPlaceButton.on('click', function () {

        var $this = $(this);
        var sectionName = $this.parent().attr('id').split('-')[0];
        var $listToAppendTo = $('#' + sectionName + '-list').find('ul');
        var placeName = $this.siblings('select').val();
        console.log("days", days)
        var dayId = days[currentDay - 1][0]._id;
        $.post('/api/days/' + dayId + '/' + sectionName, { name: placeName })
        .done(function(placeObj) {

          $listToAppendTo.append(createItineraryItem(placeName));
          console.log("PLACE OBJ", placeObj)

          var createdMapMarker = drawLocation(map, placeObj.place[0].location, {
              icon: placeMapIcons[sectionName]
          });

          mapFit();

        })

        // var placeObj = getPlaceObject(sectionName, placeName);



        // days[currentDay - 1].push({place: placeObj, marker: createdMapMarker, section: sectionName});



    });

    $placeLists.on('click', '.remove', function (e) {

        var $this = $(this);
        var $listItem = $this.parent().parent();
        var nameOfPlace = $this.siblings('span').text();
        var indexOfThisPlaceInDay = getIndexOfPlace(nameOfPlace, days[currentDay - 1]);
        var placeInDay = days[currentDay - 1][indexOfThisPlaceInDay];

        placeInDay.marker.setMap(null);
        days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);
        $listItem.remove();

    });

    $dayButtons.on('click', '.day-btn', function () {
        setDay($(this).index() + 1);
    });

    $addDayButton.on('click', function () {


        $.post('/api/days/create', { number: days.length + 1 })
        .done(function(day) {
          days.push([day]);

          var currentNumOfDays = days.length;
          var $newDayButton = createDayButton(currentNumOfDays + 1);

          $addDayButton.before($newDayButton);

          setDayButtons(); // removes all day btns and re-adds 'em
          setDay(currentNumOfDays);
        })

    });

    $dayTitle.children('button').on('click', function () {
        removeDay(currentDay);
    });

});

// Get search form and button
var formField = document.querySelector("#inputForm");
var searchButton = document.querySelector("#searchBtn");

// Load previous city searches from local storage
renderSavedCities();

// Try to search for weather info when a user clicks the search button
searchButton.addEventListener("click", function() {
    if (formField.value == "") {
        alert("Please enter a city name before searching.");
    } else {
        var cityName = formField.value;
        formField.value = "";
        weatherResponse(cityName);
    }
});

// Retrieve weather info on a saved city when its button is clicked
$(document).on("click", ".saveCity", function () {
    var savedCity = $(this).text();
    showSavedCity(savedCity);
});

// Function to import JSON string to an object, then interate through it and add a button for each entry to the page
function renderSavedCities() {
    var cityList = JSON.parse(localStorage.getItem("Cities"));
    if (cityList !== null) {
        for (var i = 0; i < cityList.length; i++) {
            makeButton(cityList[i]);
        }
    }
};

// Add a button with the name of a searched-for city to the list-group div
function makeButton(city) {
    var newBtn = $("<button class='btn btn-primary m-1 saveCity'>");
    newBtn.text(city);
    $(".list-group").append(newBtn);
};

// Upon a new search, fetches weather info from the API, displays it, adds a button to recall the city later, and stores city in local storage
function weatherResponse(city) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=c2efb1d1dc0867fbc637aacba71f1b06&q=" + city;

    fetch(weatherUrl)
    .then(function(weatherResponse) {
        if(weatherResponse.ok) {
            weatherResponse.json()
            .then(function(weatherData) {
                showWeatherInfo(weatherData); // Use the object returned by the API to display weather
                makeButton(city); // Add a button
                saveCity(city); // Save to local storage
            });
        } else {
            alert("Error: " + weatherResponse.statusText);
        }
    })
    .catch(function(weatherError) {
        alert("Please try again later");
    });
};

function showWeatherInfo(weatherObject) {
    $(".main").attr("style", "display; visible"); // Toggle visible for "5-Day Forecast" text, etc.
    $(".card-text").empty(); // Remove any existing search entry
    var thisDate = getDate(weatherObject); // Format date, then show it
    $(".mainTitle").text(weatherObject.name + " " + thisDate);

    var icon = getIcon(weatherObject); // Show an icon representing conditions -- get icon URL
    $(".icon").attr("src", icon); // ...then slap it into the src attribute of my img element

    var theTemp = getTemp(weatherObject); // Show the temperature in degrees Fahrenheit
    var tempItem = $("<p class='card-text'>");
    tempItem.html("Temperature: " + theTemp + "&deg F");
    $(".mainBody").append(tempItem);

    var windSpeed = getWindSpeed(weatherObject); // Get the wind speed in MPH and add it
    var windItem = $("<p class='card-text'>");
    windItem.html("Wind: " + windSpeed + " MPH");
    $(".mainBody").append(windItem);

    var humItem = $("<p class='card-text'>"); // Show the relative humidity
    humItem.html("Humidity: " + weatherObject.main.humidity + "%");
    $(".mainBody").append(humItem);

    // Call functions for the UV index and 5-day forecast information
    getUvIndex(weatherObject);
    fiveDayForecast(weatherObject);
};

// Save a city to local storage
function saveCity(city) {
    var cities = JSON.parse(localStorage.getItem("Cities"));
    var cityArray = [];

    if (cities == null) {
        cityArray.push(city);
        localStorage.setItem("Cities", JSON.stringify(cityArray));
    } else {
        cities.push(city);
        localStorage.setItem("Cities", JSON.stringify(cities));
    }
};

// Display info on a saved city
function showSavedCity(city) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=c2efb1d1dc0867fbc637aacba71f1b06&q=" + city;

    $.ajax({
        method: "GET",
        url: weatherUrl,
    }).then(function (weatherResponse) {
        showWeatherInfo(weatherResponse);
    });
};

// Using Moment.js to get and format the date
function getDate(weatherObject) {
    var formattedDate = moment.unix(weatherObject.dt).format("M/DD/YY");
    return formattedDate;
};

// Get the appropriate icon URL from OpenWeather based upon icon code
function getIcon(weatherObject) {
    var iconCode = weatherObject.weather[0].icon;
    var iconURL = "https://openweathermap.org/img/wn/" + iconCode + ".png";
    return iconURL;
};

// Format the temp from OpenWeather -- I noticed later that OpenWeather lets you specify Imperial units with their API calls, but I had already begun handling the conversions, so I've left it this way.
function getTemp(weatherObject) {
    var kelvin = weatherObject.main.temp;
    var fahrenheit = (kelvin - 273) * 1.8 + 32;
    var temp = fahrenheit.toFixed(1);
    return temp;
};

// Convert wind speed from m/s to mi/h
function getWindSpeed(weatherObject) {
    var velocityMps = weatherObject.wind.speed;
    var velocityMph = velocityMps * 2.237;
    var windSpeed = velocityMph.toFixed(0);
    return windSpeed;
};

// Make an API call for UV Index data and color-code it, append it
function getUvIndex(weatherObject) {
    var lat = weatherObject.coord.lat;
    var lon = weatherObject.coord.lon;
    var uvUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=c2efb1d1dc0867fbc637aacba71f1b06&lat=" + lat + "&lon=" + lon;

    $.ajax({
        method: "GET",
        url: uvUrl
    }).then(function (uvResponse) {
        var uvItem = $("<p class='card-text'>");
        uvItem.html("UV Index: ");
        var numSpan = $("<span class='badge'>");
        numSpan.html(uvResponse.value);
        uvItem.append(numSpan);

        // Color-code UV Index data for favorable, moderate, or severe
        if (uvResponse.value <= 5.99) {
            numSpan.attr("style", "background-color: green;");
        } else if (uvResponse.value > 5.99 && uvResponse.value < 8) {
            numSpan.attr("style", "background-color: orange;");
        } else if (uvResponse.value > 7.99 && uvResponse.value < 10.99) {
            numSpan.attr("style", "background-color: red;");
        } else {
            numSpan.attr("style", "background-color: violet;");
        }
        $(".mainBody").append(uvItem);
    });
};

// Make a OneCall API call for the forecast, append the returned data into the HTML
function fiveDayForecast(weatherObject) {
    $(".fiveDay").empty() // Clear any existing forecast
    $(".forecastTitle").attr("style", "display: inline")
    var lat = weatherObject.coord.lat;
    var lon = weatherObject.coord.lon;
    var oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?appid=c2efb1d1dc0867fbc637aacba71f1b06&exclude=current,minutely,hourly,alerts&lat=" + lat + "&lon=" + lon;

    $.ajax({
        method: "GET",
        url: oneCallUrl
    }).then(function (fiveDayResponse) {
        var forecast = (fiveDayResponse.daily)
        
        for (var i = 1; i < 6; i++) {
            var day = forecast[i];
            var dayDiv = $("<div class='card bg-secondary p-1 forecast'>")

            var eachDate = getDate(day); // Make and append date headers
            var dateHead = $("<h4>");
            dateHead.html(eachDate);
            dayDiv.append(dateHead);

            var eachURL = getIcon(day); // Make and append icon images
            var iconTag = $("<img class='dayIcon'>")
            iconTag.attr("src", eachURL);
            dayDiv.append(iconTag);

            var kelvin = day.temp.max; // And temperature data
            var fahrenheit = (kelvin - 273) * 1.8 + 32;
            var temp = fahrenheit.toFixed(1);
            var tempTag = $("<p>")
            tempTag.html("Temperature: " + temp + "&deg F");
            dayDiv.append(tempTag);

            var windTag = $("<p>"); // And wind speed
            windTag.html("Wind: " + (day.wind_speed * 2.237).toFixed(0) + " MPH");
            dayDiv.append(windTag);

            var humTag = $("<p>"); // Append humidity data
            humTag.html("Humidity: " + day.humidity + "%");
            dayDiv.append(humTag);

            $(".fiveDay").append(dayDiv);
        }
    });
};
// OpenWeatherMap API key:
// c2efb1d1dc0867fbc637aacba71f1b06
// e.g. https://api.openweathermap.org/data/2.5/weather?APPID=c2efb1d1dc0867fbc637aacba71f1b06&q= [city name]

//     Acceptance criteria:
// GIVEN a weather dashboard with form inputs
// WHEN I search for a city
// THEN I am presented with current and future conditions for that city and that city is added to the search history
// WHEN I view current weather conditions for that city
// THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city

var formField = document.querySelector("#inputForm");
var searchButton = document.querySelector("#searchBtn");

renderSavedCities();

// Try to search when a user clicks the button
searchButton.addEventListener("click", function() {
    if (formField.value == "") {
        alert("Please enter a city name before searching.");
    } else {
        var cityName = formField.value;
        formField.value = "";
        weatherResponse(cityName);
    }
})

// Pull up weather info on a saved city when its button is clicked
$(document).on("click", ".saveCity", function () {
    var savedCity = $(this).text();
    showSavedCity(savedCity);
})


// Get info from the API and display it
function weatherResponse(city) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=c2efb1d1dc0867fbc637aacba71f1b06&q=" + city;

    fetch(weatherUrl)
    .then(function(weatherResponse) {
        if(weatherResponse.ok) {
            weatherResponse.json()
            .then(function(weatherData) {
                showWeatherInfo(weatherData);
                printNewButton(city);
                saveCity(city);
            });
        } else {
            alert("Error: " + weatherResponse.statusText);
        }
    })
    .catch(function(weatherError) {
        alert("Please try again later");
    });
}

// Save a city to local storage
function saveCity(city) {
    var cities = JSON.parse(localStorage.getItem("Cities"));
    var cityArray = [];

    if (cities == null) {
        cityArray.push(city);
        localStorage.setItem("Cities", JSON.stringify(cityArray));
    } else {
        cities.push(city)
        localStorage.setItem("Cities", JSON.stringify(cities));
    }
}

// Display info on a saved city
function showSavedCity(city) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=c2efb1d1dc0867fbc637aacba71f1b06&q=" + city;

    $.ajax({
        method: "GET",
        url: weatherUrl,
    }).then(function (weatherResponse) {
        showWeatherInfo(weatherResponse);
    })
}

// Review these function calls
function showWeatherInfo(weatherObject) {

    $(".master").attr("style", "display; visible")
    $(".card-text").empty()

    //Retrieve date and format it
    var thisDate = getDate(weatherObject);
    $(".mainTitle").text(weatherObject.name + " " + thisDate);

    //Print Icon
    var icon = displayIcon(weatherObject);
    $(".icon").attr("src", icon);

    //Print temperature
    var farPrint = getTemp(weatherObject);
    var tempItem = $("<p class='card-text'>");
    tempItem.html("Temperature: " + farPrint + "&deg F");
    $(".mainBody").append(tempItem);

    //Print Humidity
    var humItem = $("<p class='card-text'>");
    humItem.html("Humidity: " + weatherObject.main.humidity + "%");
    $(".mainBody").append(humItem);

    //Print wind speed
    var windSpeed = getWindSpeed(weatherObject);
    var windItem = $("<p class='card-text'>");
    windItem.html("Wind Speed: " + windSpeed + " MPH");
    $(".mainBody").append(windItem);

    //Print UV Index
    getUvIndex(weatherObject);

    //Print 5 day
    fiveDayForecast(weatherObject);
}

// Check calls
function fiveDayForecast(object) {
    $(".fiveDay").empty()
    $(".forecastTitle").attr("style", "display: inline")

    var lat = object.coord.lat;
    var lon = object.coord.lon;

    var currentURL = "https://api.openweathermap.org/data/2.5/onecall?appid=c2efb1d1dc0867fbc637aacba71f1b06&exclude=current,minutely,hourly,alerts&lat=" + lat + "&lon=" + lon;

    $.ajax({
        method: "GET",
        url: currentURL
    }).then(function (fiveDayResponse) {
        var forecast = (fiveDayResponse.daily)
        console.log(fiveDayResponse);

        for (var i = 1; i < 6; i++) {
            var day = forecast[i];
            //create variable
            var dayDiv = $("<div class='card bg-dark p-1 forecast'>")

            //create date dive
            var eachDate = getDate(day);
            // console.log(eachDate);
            var dateHead = $("<h4>");
            dateHead.html(eachDate);
            dayDiv.append(dateHead);

            //create icon div
            var eachURL = displayIcon(day);
            var iconTag = $("<img class='dayIcon'>")
            iconTag.attr("src", eachURL);
            dayDiv.append(iconTag);

            //temperature
            var kelvin = day.temp.max;
            var farenheit = (kelvin - 273) * 1.8 + 32;
            var temp = farenheit.toFixed(1);
            var tempTag = $("<p>")
            tempTag.html("Temperature: " + temp + "&deg F");
            dayDiv.append(tempTag);
            //humidity

            // var windTag = $("<p>");
            // windTag.html("Wind: " + getWindSpeed(day) + " MPH");
            // dayDiv.append(windTag);

            var humTag = $("<p>");
            humTag.html("Humidity: " + day.humidity + "%");
            dayDiv.append(humTag);

            $(".fiveDay").append(dayDiv);
        }
    })

}

// Check calls
function getUvIndex(object) {
    var lat = object.coord.lat;
    var lon = object.coord.lon;

    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=c2efb1d1dc0867fbc637aacba71f1b06&lat=" + lat + "&lon=" + lon;

    $.ajax({
        method: "GET",
        url: uvURL
    }).then(function (uvResponse) {
        var uvItem = $("<p class='card-text'>");
        uvItem.html("UV Index: ");
        var numSpan = $("<span class='badge'>");
        numSpan.html(uvResponse.value);
        uvItem.append(numSpan);

        if (uvResponse.value <= 5.99) {
            numSpan.attr("style", "background-color: green;")
        } else if (uvResponse.value > 5.99 && uvResponse.value < 8) {
            numSpan.attr("style", "background-color: orange;")
        } else if (uvResponse.value > 7.99 && uvResponse.value < 10.99) {
            numSpan.attr("style", "background-color: red;")
        } else {
            numSpan.attr("style", "background-color: violet;")
        }
        $(".mainBody").append(uvItem);
    })
}

function getWindSpeed(object) {
    var speedMPS = object.wind.speed;
    var convertSpeed = speedMPS * 2.2369;
    var speed = convertSpeed.toFixed(1);
    return speed;
}

function getTemp(object) {
    var kelvin = object.main.temp;
    var farenheit = (kelvin - 273) * 1.8 + 32;
    var temp = farenheit.toFixed(1);
    return temp;
}

function displayIcon(object) {
    var iconcode = object.weather[0].icon;
    var iconURL = "https://openweathermap.org/img/wn/" + iconcode + ".png";
    return iconURL
}

function getDate(object) {
    var date = moment.unix(object.dt).format("M/DD/YY");
    return date;
}

function renderSavedCities() {
    var list = JSON.parse(localStorage.getItem("Cities"));
    if (list !== null) {
        for (var i = 0; i < list.length; i++) {
            printNewButton(list[i]);
        }
    }
}

function printNewButton(place) {
    var newBtn = $("<button class='btn btn-primary m-1 saveCity'>");
    newBtn.text(place);
    $(".list-group").append(newBtn);
}
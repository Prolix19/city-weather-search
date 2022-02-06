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

searchButton.addEventListener("click", function() {

    if (formField.value == "") {
        alert("Please enter a city name before searching.");
    } else {
        var cityName = formField.value;
        formField.value = "";
        weatherResponse(cityName);
    }
})

function weatherResponse(city) {
    var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?appid=c2efb1d1dc0867fbc637aacba71f1b06&q=" + city;

    fetch(weatherUrl)
    .then(function(weatherResponse) {
        if(weatherResponse.ok) {
            weatherResponse.json()
            .then(function(weatherData) {
                // Do stuff with the weatherData
                console.log(weatherData);
            });
        } else {
            alert("Error: " + weatherResponse.statusText);
        }
    })
    .catch(function(weatherError) {
        alert("Please try again later");
    });
}
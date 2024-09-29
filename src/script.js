const searchInput = document.querySelector(".search-input input");
const currentWeatherDiv = document.querySelector(".current-weather");
const locationBtn = document.querySelector(".location-btn");

const noResultsDiv = document.querySelector(".no-results");
const title = noResultsDiv.querySelector(".title p");
const accessDeniedIcon = noResultsDiv.querySelector(".no-results .no-result-icon img");
const description = noResultsDiv.querySelector(".description p");

const hourlyWeatherDiv = document.querySelector(".weather-list");

const searchResultBox = document.querySelector(".search-result-box");

noResultsDiv.classList.add("hidden");

const API_KEY = "7f189c45374b48f4b0d112212241708";

// weather codes for mapping custom icons
const weatherCodes = {
    clear: [1000],
    clouds: [1003, 1006, 1009],
    mist: [1030, 1135, 1147],
    rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
    moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
    snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
    thunder: [1087, 1279, 1282],
    thunder_rain: [1273, 1276],
}

// show suggestion when user searching specific city
const searchingCity = async (cityName, e) => {
    if (cityName) {
        const SEARCH_API = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${cityName}`;

        const response = await fetch(SEARCH_API);
        const data = await response.json();

        let keywords = [];
        let resultBoxHTML;
        data.forEach(object => {
            keywords.push([object.name, object.country]);
        });

        if (keywords.length === 0) {
            resultBoxHTML = `<li class="city-country-li cursor-default">
                                <div class="city flex justify-center items-center"> No results </div>
                            </li>`;
        }
        else {
            let count = 0;
            let dataCityCount = 0;

            resultBoxHTML = keywords.map((item) => {
                count++;
                dataCityCount++;
                if (count == keywords.length) {
                    // add two attributes : data-city, data-city-count. for get which city and Where does it rank in this list ?   
                    return `<li class="city-country-li" data-city="${item[0]}" data-city-count="${dataCityCount}">
                                <div class="city">${item[0]} </div>
                                <div class="country">${item[1]} </div>
                            </li> `;
                }
                else {
                    return `<li class="city-country-li border-b-[1px] border-b-black" data-city="${item[0]}" data-city-count="${dataCityCount}">
                                <div class="city">${item[0]} </div>
                                <div class="country">${item[1]} </div>
                            </li> `;
                }
            }).join("");
        }

        searchResultBox.querySelector("ul").innerHTML = resultBoxHTML;

        // add click event for when click any list to show city's weather detail
        const searchedCity = searchResultBox.querySelectorAll("ul li");

        Array.from(searchedCity).forEach((city) => {
            let getDataCity = city.getAttribute("data-city");
            let getDataCityCount = city.getAttribute("data-city-count");

            // get objects url key to search city
            let searchedCityObjectUrl = data[getDataCityCount - 1].url;

            const SEARCH_API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${searchedCityObjectUrl}&days=2`;
            console.log(SEARCH_API_URL);

            city.addEventListener('click', () => {
                searchInput.value = data[getDataCityCount - 1].name;
                getWeatherDetails(SEARCH_API_URL);
                searchResultBox.querySelector("ul").innerHTML = "";

                searchResultBox.querySelector("ul").innerHTML = '';
            });
        })

    }
    else { searchResultBox.querySelector("ul").innerHTML = '' }
};

const displayHourlyWeatherData = (hourlyData) => {
    const currentHour = new Date().setMinutes(0, 0, 0);
    const next24Hours = currentHour + (24 * 60 * 60 * 1000);

    // Filter the hourly data to only include next 24 hours
    const next24HoursData = hourlyData.filter(({ time }) => {
        const forecastTime = new Date(time).getTime();
        return forecastTime >= currentHour && forecastTime <= next24Hours;
    });

    const hourlyWeatherHTML = next24HoursData.map(item => {
        const temperature = Math.floor(item.temp_c);
        const time = item.time.split(" ")[1];
        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(item.condition.code));

        return `<div class="hourly-weather-item flex flex-col justify-center items-center gap-2" >
                        <div class="hourly-weather-time font-semibold"> ${time} </div>
    
                        <div class="hourly-weather-icon">
                            <img src="./src/icons/${weatherIcon}.svg" class="w-[28px] aspect-[1]" draggable="false">
                        </div>
    
                        <div class="temperature font-semibold">
                            ${temperature}°
                        </div>
                    </div > `
    }).join("");

    document.querySelector(".weather-list").innerHTML = hourlyWeatherHTML;
}

const getWeatherDetails = async (URL) => {
    try {
        noResultsDiv.classList.add("hidden");
        currentWeatherDiv.classList.remove("hidden");
        hourlyWeatherDiv.classList.remove("hidden");

        const response = await fetch(URL);
        const data = await response.json();

        const temperature = Math.floor(data.current.temp_c);
        const description = data.current.condition.text;
        const weatherIcon = Object.keys(weatherCodes).find(icon => weatherCodes[icon].includes(data.current.condition.code));

        currentWeatherDiv.querySelector(".weather-icon img").src = `./src/icons/${weatherIcon}.svg`;
        currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature} <span class="font-medium text-2xl content-start">°C</span>`;
        currentWeatherDiv.querySelector(".description").innerText = description;

        const combinedHourlyData = [...data.forecast.forecastday[0].hour, ...data.forecast.forecastday[1].hour];

        searchInput.value = data.location.name;

        displayHourlyWeatherData(combinedHourlyData);

    } catch (error) {
        noResultsDiv.classList.remove("hidden");
        currentWeatherDiv.classList.add("hidden");
        hourlyWeatherDiv.classList.add("hidden");

        searchInput.value = '';
        title.innerText = "City not found";
        accessDeniedIcon.src = "./src/icons/no-result.svg";
        description.innerText = "We are unable to retrieve the weather details for the city you entered.";
    }
}

// set weather request for specific city
const specificWeatherRequest = (cityName) => {
    const URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
    getWeatherDetails(URL);
}

searchInput.addEventListener("keyup", (e) => {
    const cityName = searchInput.value.trim();
    if (e.key === "Enter" && cityName) {
        searchResultBox.querySelector("ul").innerHTML = "";
        specificWeatherRequest(cityName);
    }
    else if (e.key === "Escape") {
        searchResultBox.querySelector("ul").innerHTML = '';
    }
    else {
        searchingCity(cityName, e);
        console.log(e.key);
        
    }

});

locationBtn.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;

        const URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;

        getWeatherDetails(URL);

    }, error => {
        title.innerText = "Access denied";
        accessDeniedIcon.src = "./src/icons/access_denied.svg";
        description.innerText = "Location access denied. Please allow to use this feature.";

        noResultsDiv.classList.remove("hidden");
        currentWeatherDiv.classList.add("hidden");
        hourlyWeatherDiv.classList.add("hidden");
    })
})

document.addEventListener("click", () => {
    searchResultBox.querySelector("ul").innerHTML = '';
})
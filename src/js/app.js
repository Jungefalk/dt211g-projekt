"use strict"

//Global variables
let userLocationName = "";
let forecastData = [];
let pollenData = [];
let todaysForecast = [];
let messageEl = 0;
let geoRegionName = "";

//get elements by id and store them in variable
/** @type {HTMLDivElement} Element where geolocated region loads */
const geoRegionEl = document.getElementById("geoRegion");

/** @type {HTMLDivElement} Element where all regions where there are measuring stations are loaded*/
const allRegionsEl = document.getElementById("allRegions");

/** @type {HTMLDivElement} Element where the bar chart is loaded*/
const barChartEl = document.getElementById("barChart");

/**@type {HTMLButtonElement} Button element */
const showBtnEl = document.getElementById("showBtn")


//Eventlistener 
window.addEventListener("load", init);
showBtnEl.addEventListener("click", toggleRegionContainer);

/**
 * Displays the regions-list on click
 */
function toggleRegionContainer() {

    const regionsContainerEl = document.getElementById("regionsContainer")

    if (regionsContainerEl.style.display === "none") {
        regionsContainerEl.style.display = "flex";
    } else {
        regionsContainerEl.style.display = "none";
    }
};

/**
 * Function init - Calls a function once the pages is fully loaded
 * @function
 */
function init() {

    console.log("Sidan har laddat in");
    checkUserCoordinates();
    fetchPollenData();
}
/**
 * Function that checks if geolocation is supported and gets users coodinates or returns errormessage
 * @function
 */
function checkUserCoordinates() {

    //check if geolocation is supported by browser
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {

            //get lat and lon from position and store in variables
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            console.log("Användarens koordinater:", latitude, longitude)

            //Call function
            fetchUserLocation(latitude, longitude);


        }, function (error) {
            //If geolocation is not supported call error-message function
            fetchRegionData()

        });

    } else {
        //If geolocation is not supported call error-message function
        readLocationErrorMessage();
    };

};

/**
 * Function that converts users lat and lon to name of city with NominatiAPI
 * @async
 * @function
 * @param {number} latitude  - User's latitude
 * @param {number} longitude - User's longitude
 */
async function fetchUserLocation(latitude, longitude) {

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        const locationData = await response.json();
        console.log(locationData);

        //multiple options depending on location type in nominatim.
        userLocationName = locationData.address.city || locationData.address.town || locationData.address.village;
        console.log("Användaren befinner sig:", userLocationName);

        fetchRegionData()

    } catch (error) {
        console.error("Ett fel uppstod:", error.message)
    };


};

/**
 * Function that fetches region-data from the pollen.api
 * @async
 * @function
 */
async function fetchRegionData() {
    try {
        const response = await fetch(`https://api.pollenrapporten.se/v1/regions`);
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        const regionData = await response.json();
        readRegionData(regionData);

    } catch (error) {
        console.error("Det uppstod ett fel", error.message)
    };


};


/**
 * Function that receives and checks region data then updates DOM
 * @function
 * @param {object} regionData 
 */
function readRegionData(regionData) {

    //Check if users location matches any region names and update DOM

    let checkedRegion = regionData.items.find(region => region.name === userLocationName);

    if (checkedRegion) {
        geoRegionName = document.createElement("p");
        let geoRegionText = document.createTextNode(`${checkedRegion.name}`);
        geoRegionName.appendChild(geoRegionText);
        geoRegionEl.appendChild(geoRegionName);

        console.log("Användarens plats ligger vid mätstation")
        fetchForecast(checkedRegion.id)

    } else {
        readLocationErrorMessage();
    }

    //loop data and update dom
    regionData.items.forEach(data => {

        let newLiEl = document.createElement("li");
        let newLiText = document.createTextNode(`${data.name}`);
        newLiEl.appendChild(newLiText);
        allRegionsEl.appendChild(newLiEl);

        //send region ID of the clicked region to fetch the pollen forecast api and update DOM 
        newLiEl.addEventListener("click", function () {


            //Update textcontent with the chosen region name
            if (messageEl) {
                messageEl.textContent = `${data.name}`
            };
            if (geoRegionName) {
                geoRegionName.textContent = `${data.name}`
            };


            fetchForecast(data.id)
        });
    });

};


/**
 * Function that fetches pollen forecast data and processes todays pollen-forecast. 
 * It matches pollentypes and updates "todaysForcast".
 * @async
 * @function
 * @param {string} regionId -- id of the users actual or chosen region.
 */
async function fetchForecast(regionId) {
    try {
        const response = await fetch(`https://api.pollenrapporten.se/v1/forecasts?region_id=${regionId}&current=true`);
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        forecastData = await response.json();
        let checkDate = forecastData.items[0].levelSeries;
        console.log("det här är användarens:", forecastData);

        //empty array incase user switches location
        todaysForecast = [];

        //check if the forecast is todays date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log(today)

        checkDate.forEach(data => {

            let apiDate = new Date(data.time);
            apiDate.setHours(0, 0, 0, 0);

            //match polleniD in forecast with pollen-types to get the pollen name
            let pollenIdMatch = pollenData.items.find(pollen => pollen.id === data.pollenId);


            //check date an create new objet
            if (apiDate.getTime() === today.getTime()) {
                todaysForecast.push({
                    pollenId: data.pollenId,
                    level: data.level,
                    time: data.time,
                    name: pollenIdMatch.name //add pollen name
                });
            };
        });
        console.log(todaysForecast);

        readBarChart();

    } catch (error) {
        console.error("Det uppstod ett fel:", error.message)
    };
};

/**
 * Function that fetches pollen data from pollen api
 * @async
 * @function
 */
async function fetchPollenData() {
    try {
        const response = await fetch(`https://api.pollenrapporten.se/v1/pollen-types`);
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        pollenData = await response.json();
        console.log(pollenData);

    } catch (error) {
        console.error("Det uppstod ett fel:", error.message)
    };
};

/**
 * Function that reads out barChart
 * @function
 */

function readBarChart() {

    const pollenName = todaysForecast.map(pollen => pollen.name);
    const pollenLevel = todaysForecast.map(pollen => pollen.level);

    const options = {
        chart: {
            type: 'bar'
        },
        series: [{
            name: 'Pollennivå',
            data: pollenLevel
        }],
        xaxis: {
            categories: pollenName,
        },
        yaxis: {
            tickAmount: 5,
            max: 5,

        }
    }

    const chart = new ApexCharts(document.querySelector("#barChart"), options);

    chart.render();
}

/**
 * Function that creates <p> - element and shows message in case user location cannot be found or does not match any region
 * @function
 */
function readLocationErrorMessage() {

    messageEl = document.createElement("p");
    let newMessageText = document.createTextNode('Din plats kunde inte hämtas. Välj din närmaste mätstation nedan.');
    messageEl.appendChild(newMessageText);
    messageEl.classList.add("errorMessage");
    geoRegionEl.appendChild(messageEl);

    console.log("Användarens plats kunde inte hämtas");
};

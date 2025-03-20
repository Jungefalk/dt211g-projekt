"use strict"

//Global variables

let userLocationName = "";
let forecastData= [];

//get elements by id and store them in variable
/** @type {HTMLDivElement} Element where geolocated region loads */
const geoRegionEl = document.getElementById("geoRegion");

/** @type {HTMLDivElement} Element where all regions where there are measuring stations are loaded*/
const allRegionsEl = document.getElementById("allRegions");

/** @type {HTMLDivElement} Element where the bar chart is loaded*/
const barChartEl = document.getElementById("barChart");


//Eventlistener 
window.addEventListener("load", init);

/**
 * Function init - Calls a function once the pages is fully loaded
 * @function
 */
function init() {

    console.log("Sidan har laddat in");
    checkUserCoordinates();
    fetchRegionData()
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
        let newParagraphEl = document.createElement("p");
        let newParagraphText = document.createTextNode(`${checkedRegion.name}`);
        newParagraphEl.appendChild(newParagraphText);
        geoRegionEl.appendChild(newParagraphEl);

        console.log("Användarens plats ligger vid mätstation")
        fetchForecast(checkedRegion.id)

    } else {
        readLocationErrorMessage();
    }

    //loop data and update dom
    regionData.items.forEach(data => {

        let newParagraphEl = document.createElement("p");
        let newParagraphText = document.createTextNode(`${data.name}`);
        newParagraphEl.appendChild(newParagraphText);
        allRegionsEl.appendChild(newParagraphEl);

        //event listener that sends region ID of the clicked region to fetch the pollen forecast api
        newParagraphEl.addEventListener("click", function () {
            fetchForecast(data.id)
        });
    });

};
/**
 * Function that fetches data from forecast pollen api based on received region id
 * @async
 * @function
 * @param {number} regionId -- id of the users actual or chosen region.
 */
async function fetchForecast(regionId) {
    try {
        const response = await fetch(`https://api.pollenrapporten.se/v1/forecasts?region_id=${regionId}&current=true`);
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        forecastData = await response.json();
        console.log("det här är användarens:", forecastData);

    }catch (error){
        console.error("Det uppstod ett fel:", error.message)
    };
};

/**
 * Function that creates <p> - element and shows message in case user location cannot be found or does not match measurestation city
 * @function
 */
function readLocationErrorMessage() {

    let newPEl = document.createElement("p")
    let newPElText = document.createTextNode('Din plats kunde inte hämtas. Välj din närmaste mätstation nedan.')
    newPEl.appendChild(newPElText)
    geoRegionEl.appendChild(newPEl)

    console.log("Användarens plats kunde inte hämtas")
};

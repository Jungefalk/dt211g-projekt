"use strict"

//Global variables

let userLocationName = "";

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

    console.log("Sidan har laddat in")
    checkUserCoordinates()
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

            console.log(latitude, longitude)

            //Call function
            fetchUserCity(latitude, longitude);


        }, function (error) {
            //If geolocation is not supported call error-message function
            readLocationErrorMessage();

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
async function fetchUserCity(latitude, longitude) {

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        if (!response.ok) {
            throw new Error("fel vid anslutning");
        };

        const locationData = await response.json();
        console.log(locationData);

        //multiple options depending on location type.
        let userLocationName = locationData.address.city || locationData.address.town || locationData.address.village;
        console.log(userLocationName);

    } catch (error) {
        console.error("Ett fel uppstod:", error.message)
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
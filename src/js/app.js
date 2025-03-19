"use strict"

//get elements by id and store them in variable

/** @type {HTMLDivElement} Element where geolocated region loads */
const geoRegionEl = document.getElementById("geoRegion");

/** @type {HTMLDivElement} Element where all regions where there are measuring stations are loaded*/
const allRegionsEl = document.getElementById("allRegions");

/** @type {HTMLDivElement} Element where the bar chart is loaded*/
const barChartEl = document.getElementById("barChart");


//Eventlistener 
window.addEventListener("load", init);


function init(){

    console.log("Sidan har laddat in")
    fetchUserLocation()
}
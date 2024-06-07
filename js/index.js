import { populateStopsDatalist, searchStop } from "./map.js";

populateStopsDatalist();
export var map = L.map('map').setView([45.7578137, 4.8320114], 5);
export var network = new L.layerGroup();
network.addTo(map);

const search_bar = document.getElementById("search_bar");
search_bar.addEventListener("change", searchStop);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '<a href="https://carto.com/">&copy; CARTO</a> <a href="http://openmaptiles.org/">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>'
}).addTo(map);

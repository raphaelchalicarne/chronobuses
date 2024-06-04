function populateStopsDatalist() {
  fetch("./data/stops.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      var stops_select = document.getElementById("search_stop");
      let stops = data["stops_association"].sort((a, b) => a["stop_name"].localeCompare(b["stop_name"]));
      stops.forEach(stop_data => {
        let option = document.createElement('option');
        option.id = stop_data["stop_id"];
        option.value = stop_data["stop_name"];
        option.label = stop_data["stop_name"];
        stops_select.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function searchStop(event) {
  let stop_search = document.getElementById("search_stop");
  let selected_stop = stop_search.options[stop_search.selectedIndex];
  fetchStops().then(stops => displayStopRoutes(stops, selected_stop.value));
  event.preventDefault();
  stop_search.selectedIndex = -1;
}

async function fetchStops() {
  try {
    const res = await fetch("./data/stops.json");
    return jsonPayload(res);
  } catch (error) {
    return console.error("Unable to fetch data:", error);
  }
}

async function fetchTrips() {
  try {
    const res = await fetch("./data/trips.json");
    return jsonPayload(res);
  } catch (error) {
    return console.error("Unable to fetch data:", error);
  }
}

function jsonPayload(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

async function displayStopRoutes(stops, stop_search) {
  network.clearLayers();
  let stop = stops["stops_association"].find((stop) => stop["stop_name"] == stop_search);
  displayStop(stop);
  map.setView([stop["stop_lat"], stop["stop_lon"]], 5);
  let trip_ids = stop["trip_ids"].split(",");
  fetchTrips().then((trips_data) => displayTrips(trips_data, trip_ids));
  fetchTrips().then((trips_data) => displayConnectedStops(trips_data, trip_ids));
}

async function displayTrips(trips_data, trip_ids) {
  let shapes = trip_ids
    .map(
      (trip_id) => trips_data["route_trips"]
        .find((trip) => trip["trip_id"] == trip_id)["shape"]
    )
    .filter(x => x);
  L.polyline(
    shapes,
    { color: '#73D700' }
  ).addTo(network);
}

async function displayConnectedStops(trips_data, trip_ids) {
  let trips = trips_data["route_trips"]
    .filter((trip_data) => trip_ids.includes(trip_data["trip_id"]));
  let all_stop_ids = trips.map((trip_data) => trip_data["sorted_stops"]).join(',').split(',');
  let unique_stop_ids = Array.from(new Set(all_stop_ids));
  displayStops(unique_stop_ids);
}

function displayTrip(trip_id) {
  fetch("./data/trips.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      L.polyline(
        data["route_trips"].find((trip) => trip["trip_id"] == trip_id)["shape"],
        { color: '#73D700' }
      ).addTo(map)
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function displayStop(stop_data) {
  L.marker([stop_data["stop_lat"], stop_data["stop_lon"]])
    .addTo(network)
    .bindTooltip(stop_data["stop_name"])
    .on('click', onMarkerClick);
}

function displayStops(stop_ids) {
  fetch("./data/stops.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      let stops = data["stops_association"]
        .filter((stop_data) => stop_ids.includes(stop_data["stop_id"]));
      stops.forEach((stop_data) => displayStop(stop_data));
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function onMarkerClick(e) {
  var stop_name = e.target.getTooltip().getContent();
  displayStopRoutes(stop_name);
}

populateStopsDatalist();
var map = L.map('map').setView([45.7578137, 4.8320114], 5);

const search_bar = document.getElementById("search_bar");
search_bar.addEventListener("change", searchStop);

var network = new L.layerGroup();
network.addTo(map);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '<a href="https://carto.com/">&copy; CARTO</a> <a href="http://openmaptiles.org/">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>'
}).addTo(map);

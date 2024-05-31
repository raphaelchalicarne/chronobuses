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
      var stops_datalist = document.getElementById("stops");
      let stops = data["stops_association"];
      stops.forEach(stop_data => {
        let option = document.createElement('option');
        option.id = stop_data["stop_id"];
        option.value = stop_data["stop_name"];
        option.label = stop_data["stop_name"];
        stops_datalist.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function searchStop(event) {
  let stop_search = document.getElementById("search_stop").value;
  event.preventDefault();
  network.clearLayers();
  displayStopRoutes(stop_search);
}

function displayStopRoutes(stop_search) {
  fetch("./data/stops.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      let stop = data["stops_association"]
        .find((stop) => stop["stop_name"] == stop_search);
      displayStop(stop);
      console.log(stop);
      let trip_ids = stop["trip_ids"].split(",");
      displayTrips(trip_ids);
      displayConnectedStops(trip_ids);
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function displayTrips(trip_ids) {
  fetch("./data/trips.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      let shapes = trip_ids.map(
        (trip_id) => data["route_trips"]
          .find((trip) => trip["trip_id"] == trip_id)["shape"]
      );
      L.polyline(
        shapes,
        { color: '#73D700' }
      ).addTo(network);
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

function displayConnectedStops(trip_ids) {
  fetch("./data/trips.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      let trips = data["route_trips"]
        .filter((trip_data) => trip_ids.includes(trip_data["trip_id"]));
      let all_stop_ids = trips.map((trip_data) => trip_data["sorted_stops"]).join(',').split(',');
      let unique_stop_ids = Array.from(new Set(all_stop_ids));
      displayStops(unique_stop_ids);
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
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
    .bindTooltip(stop_data["stop_name"]);
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
      // console.log(stops);
      stops.forEach((stop_data) => displayStop(stop_data));
    }
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}

populateStopsDatalist();
var map = L.map('map').setView([45.7578137, 4.8320114], 5);

const search_bar = document.getElementById("search_bar");
search_bar.addEventListener("submit", searchStop);

var network = new L.layerGroup();
network.addTo(map);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '<a href="https://carto.com/">&copy; CARTO</a> <a href="http://openmaptiles.org/">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a>'
}).addTo(map);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function searchStop(event) {
  let stop_search = document.getElementById("search_stop").value;
  event.preventDefault();
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
        .find((stop) => stop["stop_name"].startsWith(stop_search));
      console.log(stop);
      let trips = stop["trip_ids"].split(",");
      return trips.forEach(trip_id => displayTrip(trip_id))
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

var map = L.map('map').setView([45.7578137, 4.8320114], 5);
const search_bar = document.getElementById("search_bar");
search_bar.addEventListener("submit", searchStop);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

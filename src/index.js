function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function displayLyonRoutes() {
  fetch("./data/stops.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      let lyon_trips = data["stops_association"]
        .find((stop) => stop["stop_id"] == "dcc0aca2-9603-11e6-9066-549f350fcb0c")["trip_ids"]
        .split(",");
      return lyon_trips.forEach(trip_id => displayTrip(trip_id))
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
displayLyonRoutes();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var map = L.map('map').setView([45.7578137, 4.8320114], 5);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function fetchJSONData() {
  fetch("./data/trips.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error
          (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) =>
      L.polyline(data["route_trips"][getRandomInt(1111)]["shape"], { color: '#73D700' }).addTo(map)
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}
fetchJSONData();


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

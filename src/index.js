var map = L.map('map').setView([45.7578137, 4.8320114], 6);


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
      // console.log(data)
      L.polyline(data["shape"], { color: '#73D700' }).addTo(map)
    )
    .catch((error) =>
      console.error("Unable to fetch data:", error));
}
fetchJSONData();


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

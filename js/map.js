import { map, network } from "./index.js";

async function fetchStops() {
    try {
        const res_blablabus = await fetch("./data/blablabus_stops.json");
        const res_flixbus = await fetch("./data/flixbus_stops.json");
        Promise.all([res_blablabus, res_flixbus]).then(([res_blablabus, res_flixbus]) => {
            let blablabus_payload = jsonPayload(res_blablabus);
            let flixbus_payload = jsonPayload(res_flixbus);
            return { "stops": blablabus_payload["blablabus_stops"].concat(flixbus_payload["flixbus_stops"]) };
        })
    } catch (error) {
        return console.error("Unable to fetch data:", error);
    }
}

async function fetchTrips() {
    try {
        const res = await fetch("./data/blablabus_trips.json");
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

export function populateStopsDatalist() {
    fetchStops().then((stops_data) => {
        var stops_select = document.getElementById("search_stop");
        let stops = stops_data["blablabus_stops"]
            .sort((a, b) => a["stop_name"].localeCompare(b["stop_name"]));
        stops.forEach(stop => {
            let option = document.createElement('option');
            option.id = stop["stop_id"];
            option.value = stop["stop_name"];
            option.label = stop["stop_name"];
            stops_select.appendChild(option);
        });
    });
}

export function searchStop(event) {
    let stop_search = document.getElementById("search_stop");
    let selected_stop = stop_search.options[stop_search.selectedIndex];
    fetchStops().then(stops_data => displayStopRoutes(stops_data, selected_stop.value));
    event.preventDefault();
    stop_search.selectedIndex = -1;
}

function displayStopRoutes(stops_data, stop_search) {
    network.clearLayers();
    let stop = stops_data["blablabus_stops"].find((stop) => stop["stop_name"] == stop_search);
    displayStop(stop, 'departure');
    let trip_ids = stop["trips_ids"].split(",");
    fetchTrips().then((trips_data) => displayTrips(trips_data, trip_ids));
    fetchTrips().then((trips_data) => displayConnectedStops(trips_data, trip_ids, stop["stop_id"]));
}

function displayTrips(trips_data, trip_ids) {
    let shapes = trip_ids
        .map(
            (trip_id) => trips_data["blablabus_trips"]
                .find((trip) => trip["trip_id"] == trip_id)["shape"]
        )
        .filter(x => x);
    let shapes_array = deserializeShapes(shapes);
    // Make sure that we display each company's route color when we display both.
    let route_color = "#" + trips_data["blablabus_trips"][0]["route_color"];
    var trips_polyline = L.polyline(
        shapes_array,
        { color: route_color }
    ).addTo(network);
    var network_center = trips_polyline.getCenter();
    map.setView([network_center.lat, network_center.lng], 5);
}

function displayConnectedStops(trips_data, trip_ids, departure_stop_id) {
    let trips = trips_data["blablabus_trips"]
        .filter((trip_data) => trip_ids.includes(trip_data["trip_id"]));
    let all_stop_ids = trips.map((trip_data) => trip_data["stops_ids"]).join(',').split(',');
    let unique_stop_ids = Array.from(new Set(all_stop_ids));
    fetchStops().then(stops_data => displayStops(stops_data, unique_stop_ids, departure_stop_id));
}

function displayStops(stops_data, stop_ids, filtered_stop_id = null) {
    let stops = stops_data["blablabus_stops"]
        .filter((stop_data) => stop_ids.includes(stop_data["stop_id"]) && stop_data["stop_id"] != filtered_stop_id);
    stops.forEach((stop_data) => displayStop(stop_data));
}

function displayStop(stop, departure_arrival = 'arrival') {
    L.marker(
        [stop["stop_lat"], stop["stop_lon"]],
        {
            icon: stopIcon(departure_arrival),
            zIndexOffset: departure_arrival == 'departure' ? 100 : undefined
        }
    )
        .addTo(network)
        .bindTooltip(stop["stop_name"])
        .on('click', onMarkerClick);
}

/**
 * Deserialize an array of arrays when exported as JSON.
 * @param {string[]} inputs
 * @returns {number[][][]}
 */
function deserializeShapes(inputs) {
    return inputs.map((input) => JSON.parse(input.replace(/{/g, '[').replace(/}/g, ']')));
}

function stopIcon(departure_arrival) {
    return L.AwesomeMarkers.icon({
        icon: 'bus-simple',
        prefix: 'fa',
        extraClasses: 'fa-solid',
        markerColor: departure_arrival == 'departure' ? 'green' : 'red'
    });
}

function onMarkerClick(e) {
    var stop_name = e.target.getTooltip().getContent();
    fetchStops().then(stops_data => displayStopRoutes(stops_data, stop_name));
}
import { map, network } from "./index.js";

async function fetchStops() {
    try {
        const responses_stops = await Promise.all(
            [
                fetch("./data/blablabus_stops.json"),
                fetch("./data/flixbus_stops.json"),
            ]
        ).then((responses) => Promise.all(responses.map(res => jsonPayload(res))));
        return responses_stops;
    } catch (error) {
        return console.error("Unable to fetch data:", error);
    }
}

async function fetchTrips() {
    try {
        const responses_trips = await Promise.all(
            [
                fetch("./data/blablabus_trips.json"),
                fetch("./data/flixbus_trips.json"),
            ]
        ).then((responses) => Promise.all(responses.map(res => jsonPayload(res))));
        return responses_trips;
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

function mergeStops(stops_payload) {
    let blablabus_stops_payload = stops_payload[0];
    let flixbus_stops_payload = stops_payload[1];
    let stops_data = { "stops": blablabus_stops_payload["blablabus_stops"].concat(flixbus_stops_payload["flixbus_stops"]) };
    return stops_data;
}

function mergeTrips(trips_payload) {
    let blablabus_trips_payload = trips_payload[0];
    let flixbus_trips_payload = trips_payload[1];
    let trips_data = { "trips": blablabus_trips_payload["blablabus_trips"].concat(flixbus_trips_payload["flixbus_trips"]) };
    return trips_data;
}

export function populateStopsDatalist() {
    fetchStops().then((stops_payload) => {
        var stops_select = document.getElementById("search_stop");
        let stops_data = mergeStops(stops_payload);
        let stops = stops_data["stops"]
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
    fetchStops()
        .then(stops_payload => mergeStops(stops_payload))
        .then(stops_data => displayStopRoutes(stops_data, selected_stop.id));
    event.preventDefault();
    stop_search.selectedIndex = -1;
}

function displayStopRoutes(stops_data, stop_search) {
    network.clearLayers();
    let stop = stops_data["stops"].find((stop) => stop["stop_id"] == stop_search);
    displayStop(stop, 'departure');
    let trip_ids = stop["trips_ids"].split(",");
    fetchTrips()
        .then(trips_payload => mergeTrips(trips_payload))
        .then((trips_data) => displayTrips(trips_data, trip_ids));
    fetchTrips()
        .then(trips_payload => mergeTrips(trips_payload))
        .then((trips_data) => displayConnectedStops(trips_data, trip_ids, stop["stop_id"]));
}

function displayTrips(trips_data, trip_ids) {
    let trips_grouped_by_route_color = Object.groupBy(trips_data["trips"], d => d["route_color"]);
    for (const route_color in trips_grouped_by_route_color) {
        let shapes = trip_ids
            .filter( // We only want to compute shapes of trips that share the same `route_color`. 
                (trip_id) => trips_grouped_by_route_color[route_color]
                    .map(d => d["trip_id"]).includes(trip_id)
            )
            .map(
                (trip_id) => trips_grouped_by_route_color[route_color]
                    .find((trip) => trip["trip_id"] == trip_id)["shape"]
            )
            .filter(x => x);
        let shapes_array = deserializeShapes(shapes);
        if (shapes_array.length > 0) {
            var trips_polyline = L.polyline(
                shapes_array,
                { color: "#" + route_color }
            ).addTo(network);
            var network_center = trips_polyline.getCenter();
            map.setView([network_center.lat, network_center.lng], 5);
        }
    }
}

function displayConnectedStops(trips_data, trip_ids, departure_stop_id) {
    let trips = trips_data["trips"]
        .filter((trip_data) => trip_ids.includes(trip_data["trip_id"]));
    let all_stop_ids = trips.map((trip_data) => trip_data["stops_ids"]).join(',').split(',');
    let unique_stop_ids = Array.from(new Set(all_stop_ids));
    fetchStops()
        .then(stops_payload => mergeStops(stops_payload))
        .then(stops_data => displayStops(stops_data, unique_stop_ids, departure_stop_id));
}

function displayStops(stops_data, stop_ids, filtered_stop_id = null) {
    let stops = stops_data["stops"]
        .filter((stop_data) => stop_ids.includes(stop_data["stop_id"]) && stop_data["stop_id"] != filtered_stop_id);
    stops.forEach((stop_data) => displayStop(stop_data));
}

function displayStop(stop, departure_arrival = 'arrival') {
    L.marker(
        [stop["stop_lat"], stop["stop_lon"]],
        {
            icon: stopIcon(departure_arrival),
            title: stop["stop_id"],
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
    var stop_id = e.target.options.title;
    fetchStops()
        .then(stops_payload => mergeStops(stops_payload))
        .then(stops_data => displayStopRoutes(stops_data, stop_id));
}
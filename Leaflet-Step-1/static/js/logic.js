const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Defining createMap main function
const createMap = ((data) => {

    // Initiallizing parameters
    const centerCoordinates = [32.7824, -96.7974];
    const mapZoom = 5;

    // Creating map object
    const myMap = L.map("map", {
        center: centerCoordinates,
        zoom: mapZoom
    });

    // Creating base map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    // Create a map layer 
    L.geoJSON(data, {
        // use pointToLayer to create circle markers
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getSize(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                color: "black",
                weight: 0.6,
                opacity: 0.8,
                fillOpacity: 1
            });
        },
        // Binding the pop up legend
        onEachFeature: onEachPopUp
    }).addTo(myMap)

    // Structuring the Pop up legend
    function onEachPopUp(feature, layer) {
        const format = d3.timeFormat("%d-%b-%Y at %H:%M");
        layer.bindPopup(`<strong>Place: </strong> ${feature.properties.place}<br><strong>Date and Time: </strong>${format(new Date(feature.properties.time))}<br><strong>Magnitude: </strong>${feature.properties.mag}`);
    };

    // Set up the Definition legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let magnitudes = [0, 1, 2, 3, 4, 5];
        let labels = [];
        let legendInfo = "<h5>Magnitude</h5>";
        div.innerHTML = legendInfo;
        for (var i = 0; i < magnitudes.length; i++) {
            labels.push('<li style="background-color:' + getColor(magnitudes[i] + 1) + '"> <span>' + magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '' : '+') + '</span></li>');
        }
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
    // Adding legend to myMap
    legend.addTo(myMap);
});

// Define radius based on magnitude of earthquake
const getSize = ((magnitude) => {
    return magnitude * 5;
});

// Define a color based on the magnitude of earthquake
const getColor = ((magnitude)=>  {
    switch (true) {
        case (magnitude > 5):
            return "#ff5f65";
        case (magnitude > 4):
            return "#fca35d";
        case (magnitude > 3):
            return "#fdb72a";
        case (magnitude > 2):
            return "#f7db11";
        case (magnitude > 1):
            return "#ddf400";
        default:
            return "#a2f600";
    }
});

// Calling the USGS earthquakes API 
d3.json(url).then(function(response) {
    //console.log(response);
    // Map creation
    createMap(response.features);
});

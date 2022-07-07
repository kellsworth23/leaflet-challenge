// geojson urls
const earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

const tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Creating markers and popups
const createMarkers = ((data) => {
    // Creating layer for earthquakes
    let earthquakes = L.geoJSON(data, {
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
    });

    // Structuring the Pop up legend
    function onEachPopUp(feature, layer) {
        const format = d3.timeFormat("%d-%b-%Y at %H:%M");
        layer.bindPopup(`<strong>Place: </strong> ${feature.properties.place}<br><strong>Date and Time: </strong>${format(new Date(feature.properties.time))}<br><strong>Magnitude: </strong>${feature.properties.mag}`);
    };

    // Get tectonic plates from URL
    d3.json(tectonicUrl).then(function(response) {
        const tecFeatures = response.features;
        let faultLines = L.geoJSON(tecFeatures, {
            color: "#fda101"
        });

        // calling createMap function with earthquakes and faultLines layers
        createMap(earthquakes, faultLines);
    });
});


// Defining createMap main function
const createMap = ((earthquakes, faultLines) => {

    // Initiallizing parameters
    const centerCoordinates = [32.7824, -96.7974];
    const mapZoom = 5;

    const satellite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Base link
    const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    // Dark tile attribution and URL
    const cartoLink = '<a href="http://cartodb.com/attributions">CartoDB</a>';
	const cartoURL = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    const cartoAttrib = '&copy; ' + osmLink + ' &copy; ' + cartoLink;

	// Stamen Toner tiles attribution and URL
	const stamenURL = 'http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}';
	const stamenAttrib = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // Topography tile attribution and URL
    const topoURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    const topoAttrib = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
    
    //Creation of map tiles
	const cartoMap = L.tileLayer(cartoURL, {attribution: cartoAttrib});
	const stamenMap = L.tileLayer(stamenURL,{
		  attribution: stamenAttrib,
		  subdomains: 'abcd',
		  minZoom: 0,
		  maxZoom: 20,
		  ext: 'png'
	});
    const OpenTopoMap = L.tileLayer(topoURL, {
          maxZoom: 17,
          attribution: topoAttrib
    });

    // Defining the baseMaps
    const baseMaps = {
        "Satellite": satellite,
        "Carto DarkMatter": cartoMap,
		"Stamen Toner": stamenMap,
        "Topography": OpenTopoMap
    };

    // Defining the Overlays
    const overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultLines
    };

    // Createing map object
    let myMap = L.map("map", {
        center: centerCoordinates,
        zoom: mapZoom,
        layers: [satellite, faultLines, earthquakes]
    });

    // Create layer control with baseMaps and OverlayMaps
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

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

}); // end createMap function

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
d3.json(earthquakesUrl).then(function(response) {
    //console.log(response);
    // Map creation
    createMarkers(response.features);
});

// background of the map
var greyScaleMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 20,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    }
);

// map object 
var map = L.map("map", {
    center: [40.0, -94.0],
    zoom: 3
});

// add the greyscale layer to the map
greyScaleMap.addTo(map);

//get the data from earthquake usgs last 7 days all earthquakes 

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    // get the coordinates and mag from the json file

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: .5,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 1
        };
    }

    //color will be based on depth from lightest (shallow) to darkest (deep)
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ff5f65";
            case depth > 70:
                return "#fca35d";
            case depth > 50:
                return "#fdb72a";
            case depth > 30:
                return "#f7db11";
            case depth > 10:
                return "#a3f600";
            default:
                return "#98ee00";
        }
    }

    // check that mags are not = 0 if they are plot them at depth of 1
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }


    // add geojson layer to map
    L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function (feature, layer) {
            //add popups
            layer.bindPopup(

                "Location: "
                + feature.properties.place
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                +"<br>Magnitude: "
                + feature.properties.mag
             );
        }
    }).addTo(map);

    // create a legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var depth = [-10, 10, 30, 50, 70, 90];
        
        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML += "<i style='background: " + getColor[i] + "'></i> " + depth[i] + (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // put legend to the map.
    legend.addTo(map);
});
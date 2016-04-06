/**
 * Created by simba on 16/03/2016.
 */

var bdv = {};

// dataManager Module
bdv.dataManager = function module() {
    var exports = {},
        dispatch = d3.dispatch('geoReady', 'dataReady', 'dataLoading'),
        data,
        transitcrossfilter = crossfilter(),

        location;


    exports.loadCsvData = function (_file, _cleaningFunc) {
        var loadCsv = d3.csv(_file);

        loadCsv.on('progress', function () {
            dispatch.dataLoading(d3.event.loaded);
        });

        loadCsv.get(function (_err, _response) {

            _response.forEach(function (d) {
                _cleaningFunc(d)
            });
            data = _response;

            transitcrossfilter.add(_response);

            location = transitcrossfilter.dimension(function (d) {
                return d.LOCATION;
            });

            dispatch.dataReady(_response);
        });
    };

    exports.getCleanedData = function () {
        return data
    };

    exports.loadgeoJSON = function (_file, _callback) {
        d3.json(_file, function (_err, _data) {
            _callback(_data);
        })
    };

    exports.getCrossfilterSize = function () {
        return transitcrossfilter.size()
    };

// Create a filterLocation method to filter stop data by location area.
    exports.filterLocation = function (_locationArea) {

// Get the longitudes of our bounding box, and construct an array from them.
        var longitudes = [_locationArea[0][0], _locationArea[1][0]],
            latitudes = [_locationArea[0][1], _locationArea[1][1]];

        location.filterFunction(function (d) {
            return d[0] >= longitudes[0] && d[0] <= longitudes[1] && d[1] >= latitudes[0] && d[1] <= latitudes[1];
        });
// Return all records within our bounding box.
        return location.top(Infinity);
    };

    //Create a getDelays method to filter and aggregate the delay data by stop.
    exports.getDelays = function (_locations) {
        var delayCrossfilter = crossfilter(),
        //Create a dimension by hour of the scheduled stop time.
            stopTime = delayCrossfilter.dimension(function (d) {
                return d.SCHEDULED.getHours();
            });

        //Group the dimension by hour, and reduce it by increasing the count for all delays greater than 1.
        lateArrivalsByStopTime = stopTime.group().reduce(
            function reduceAdd(p, v) {
                return v.DELAY > 0 ? p + 1 : p + 0;
            },
            function reduceRemove(p, v) {
                return 0;
            },
            function reduceInitial(p, v) {
                return 0;
            }
        );

        //Add our filtered locations to the crossfilter.
        delayCrossfilter.add(_locations);

        //Return an array contained the aggregated data, and the stopTime dimension.
        return [stopTime, lateArrivalsByStopTime];
    };

    d3.rebind(exports, dispatch, 'on');
    return exports;
};
//map module
bdv.map = function module() {
    var dispatch = d3.dispatch('hover', 'stopsEnd', 'routesEnd', 'brushing'),
        projection,
        path,
        t,
        s,
        svg,
        center,
        scale,
        size,
        brush, x1, x2, y1, y2, brushX, brushY;

    function exports(_selection) {
        // Set svg equal to the selection that invokes this module.
        svg = svg || _selection;

        // Bind an empty datum to the selection. Useful later for zooming.
        svg.datum([]);

        // Set the projection up using our scale, center, and size parameters.
        projection = projection || d3.geo.mercator()
            .scale(scale)
            .center(center)
            .translate([size[0] / 2, size[1] / 2]);

        // Set the path up using our projection defined above.
        path = path || d3.geo.path()
            .projection(projection);

        //Get the longitude of the top left corner of our map area.
        long1 = projection.invert([0, 0])[0];
        //Get the longitude of the top right corner of our map area.
        long2 = projection.invert([width, 0])[0];

        //Get the latitude of the top left corner of our map area.
        lat1 = projection.invert([0, 0])[1];
        //Get the latitude of the bottom left corner of our map area.
        lat2 = projection.invert([width, height])[1];

        //Create a linear scale generator for the x of our brush.
        brushX = d3.scale.linear()
            .range([0, size[0]])
            .domain([long1, long2]);

        //Create a linear scale generator for the y of our brush.
        brushY = d3.scale.linear()
            .range([0, size[1]])
            .domain([lat1, lat2]);

        //Create our brush using our brushX and brushY scales.
        brush = d3.svg.brush()
            .x(brushX)
            .y(brushY)
            .on('brush', function () {
                dispatch.brushing(brush);
            });
    }

    // Create a center method to serve as both a getter, and a setter.
    exports.center = function (_x) {
        if (!arguments.length)
            return center;
        center = _x;
        return this;
    };
    // Create a scale method to serve as both a getter, and a setter.
    exports.scale = function (_x) {
        if (!arguments.length) return scale;
        scale = _x;
        return this;
    };
    // Create a size method to serve as both a getter and setter.
    exports.size = function (_x) {
        if (!arguments.length)
            return size;
        size = _x;
        return this;
    };

    // Create a drawRoutes method that can be invoked to create routes for each city.
    exports.drawRoutes = function (_data) {
        svg.append('path')
            .attr('class', 'route')
            .datum(topojson.object(_data, _data.objects.routes))
            .attr('d', function (d, i) {
                return path(d, i);
            });
        // Dispatch our routesEnd event so we know with the routes visualization is complete.
        dispatch.routesEnd();
    };

    exports.drawStops = function (_data) {
        svg.selectAll('.stop')
            .data(_data.features)
            .enter().append('circle')
            .attr('cx', function (d) {
                return projection(d.geometry.coordinates)[0];
            })
            .attr('cy', function (d) {
                return projection(d.geometry.coordinates)[1];
            })
            .attr('r', 2)
            .attr('class', 'stop')
            .on('mouseover', dispatch.hover);

        //Dispatch our stopsEnd event so we know with the stops visualization is complete.
        dispatch.stopsEnd();
    };

    //Create our addBrush method.
    exports.addBrush = function () {
        svg.append('g')
            .attr('class', 'brush')
            .call(brush)
            .selectAll('rect')
            .attr('width', width);
        return this;
    };

    //Bind our custom events to the 'on' method of our function.
    d3.rebind(exports, dispatch, 'on');

    return exports;
};

bdv.radialHistogram = function module() {
    var slices = 24, // 24 hours in a day.
        innerRadius = 100, // Default inner radius
        outerRadius = 300, // Default outer radius
        innerScale = d3.scale.linear(), // Define a scale for sizes segments based on value. group, // Our empty group variable
        dimension, // Our empty dimension variable.
        offset = 50, // Label offset value.
        lowerColor, // The color used for the minimum of our range
        upperColor, // The color used for the maximum of our range
        innerRange, // The lower bound for radius value
        outerRange, // The upper bound for radius value
        color = d3.scale.linear(); // Linear color scale used for the segments.

    function chart(_selection) {
        // If the innerRange is not defined, it equals the innerRadius.
        innerRange = innerRange ? innerRange : innerRadius;

        // If the outerRange is not defined, it equals the outerRadius.
        outerRange = outerRange ? outerRange : outerRadius;

        // Our d3 arc generator for the segments.

        var arc = d3.svg.arc()
            .innerRadius(function (d, i) {
                return innerScale(d);
            })
            .outerRadius(function (d, i) {
                return outerRadius;
            })
            .startAngle(function (d, i) {
                return 2 * Math.PI * (i / slices);
            })
            .endAngle(function (d, i) {
                return 2 * Math.PI * ((i + 1) / slices);
            });

        // Our d3 arc generator for the labels.

        var label = d3.svg.arc()
            .innerRadius(outerRadius + offset)
            .outerRadius(outerRadius + offset)
            .startAngle(function (d, i) {
                return 2 * Math.PI * (i / slices);
            })
            .endAngle(function (d, i) {
                return 2 * Math.PI * ((i + 1) / slices);
            });

        //The total number of records for the city
        var totalRecords = dimension.group().all(),
        //The total number of delays for they city.
            totalDelays = group.all();

        //Obtain the min and max for both totalRecords and totalDelays.
        // if there are no records, set to zero.
        var mintotalRecords = totalRecords.length ? +totalRecords[0].key : 0,
            maxtotalRecords = totalRecords.length ? +totalRecords[totalRecords.length-1].key : 0,
            mintotalDelays = totalDelays.length ? +totalDelays[0].key : 0,
            maxtotalDelays = totalDelays.length ? +totalDelays[totalDelays.length-1].key : 0;

        //We must always have an array of length 24. Inspect the totalRecords array,
        // and totalDelays array and splice to the beginning and end as required.
        for (i=0; i<mintotalRecords; i++) {
            totalRecords.splice(i, 0, {key:i, value:0});
        }

        for(i=maxtotalRecords; i<24; i++){
            totalRecords.splice(i, 0, {key:i, value:0});
        }

        for (i=0; i<mintotalDelays; i++) {
            totalDelays.splice(i, 0, {key:i, value:0});
        }

        for(i=maxtotalDelays; i<24; i++){
            totalDelays.splice(i, 0, {key:i, value:0});
        }

        //Get the min and max values for both totalRecords, and totalDelays. We
        // will use this for our scales.
        var totalRecordsMax = d3.max(totalRecords, function (d) {return d.value;}),
            totalRecordsMin = d3.min(totalRecords, function (d) {return d.value;});

        //Set the range and domain for our innerScale using the min and max from the totalRecords.
        innerScale.range([outerRange, innerRange]).domain([totalRecordsMin, totalRecordsMax]);

        //Set the color range similarly
        color.range([lowerColor, upperColor]).domain([totalRecordsMin, totalRecordsMax]);

        //Update our segments using the current data.
        var arcs = _selection.selectAll('path')
            .data(totalDelays)
            .attr('d', function (d,i) {return arc(d.value,i);})
            .attr('fill', function (d) {return color(d.value);})
            .attr('stroke', 'black')
            .attr('class', 'slice');

        //Add any new segments using the current data.
        arcs.enter().append('path')
            .attr('d', function (d,i) {return arc(d.value,i);})
            .attr('fill', function (d) {return color(d.value);})
            .attr('class', 'slice')
            .attr('stroke', 'black');

        //Remove and extra segments.
        arcs.exit().remove();

        //Attach our mouseover event.
        arcs.on('mouseover', mouseover);

        //Add our labels.
        var labels = _selection.selectAll('text')
            .data(totalDelays).enter()
            .append("text")
            .attr("transform", function(d,i) { return "translate(" + label.centroid(d,i) + ")"; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d,i) { return i+1; });

        //Remove center text on chart update. TODO: Better way??
        _selection.selectAll('.centerText').remove();

        //Add the center text for the chart.
        var centerText = _selection.append('text')
            .attr('text-anchor', 'middle')
            .text('Mouse over a segment to see the total.')
            .attr('class', 'centerText');

        //On mouseover function to display segment total.
        function mouseover (d) {
            centerText.text('Total: ' + d.value);
        }

    }

    chart.innerRadius = function (_innerRadius) {
        if (!arguments.length)
            return innerRadius;
        innerRadius = _innerRadius;
        return chart
    };

    chart.outerRadius = function (_outerRadius) {
        if (!arguments.length) return outerRadius;
        outerRadius = _outerRadius;
        return chart
    };

    //Method to get/set the crossfilter group.
    chart.group = function (_group) {
        if (!arguments.length) return group;
        group = _group;
        return chart;
    };

    //Method to get/set the label offset.
    chart.offset = function (_offset) {
        if (!arguments.length) return offset;
        offset = _offset;
        return chart;
    };

    //Method to get/set the crossfilter dimension.
    chart.dimension = function (_dimension) {
        if (!arguments.length) return dimension;
        dimension = _dimension;
        return chart;
    };

    //Method to get/set the color range.
    chart.colorRange = function (_array) {
        if (!arguments.length) return [lowerColor, upperColor];
        lowerColor = _array[0];
        upperColor = _array[1];
        return chart;
    };

    //Method to get/set the radial range/
    chart.radialRange = function (_array) {
        if (!arguments.length) return [innerRange, outerRange];
        innerRange = _array[0];
        outerRange = _array[1];
        return chart;
    };

    return chart;
};

var zurichDataManager = bdv.dataManager(),
    sanFranciscoDataManager = bdv.dataManager(),
    genevaDataManager = bdv.dataManager();

//
//sanFranciscoDataManager.loadCsvData('/data/san_francisco/san_francisco_delay.csv', function (d) {
//    var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
//    d.DELAY = +d.DELAY_MIN;
//    delete d.DELAY_MIN;
//    d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
//    d.LATITUDE = +d.LATITUDE;
//    d.LONGITUDE = +d.LONGITUDE;
//    d.LOCATION = [d.LONGITUDE, d.LATITUDE];
//});
//
//genevaDataManager.loadCsvData('/data/geneva/geneva_delay_coord.csv', function (d) {
//    var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
//    d.DELAY = +d.DELAY;
//    d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
//    d.LATITUDE = +d.LATITUDE;
//    d.LONGITUDE = +d.LONGITUDE;
//    d.LOCATION = [d.LONGITUDE, d.LATITUDE];
//});


//console.log(zurichDataManager.getCleanedData());

//zurichDataManager.loadgeoJSON('/data/zurich/routes_topo.json', function (data) {
//    console.log(data.arcs[0][0])
//});

var width = 570,
    height = 500;

//Instantiate our radial module for each city.
var zurichRadial = bdv.radialHistogram().colorRange(['lightblue', 'darkblue'])
    .innerRadius(5)
    .outerRadius(200)
    .offset(15)
    .radialRange([100,200]);

//Zurich
var zurichMap = bdv.map()
    .center([8.5390, 47.3687])
    .scale(900000)
    .size([width, height]);

d3.select('#zurich_map')
    .append('svg').attr('width', width)
    .attr('height', height)
    .call(zurichMap);


//Set up the DOM for each city for the radial chart.
var zurichHist = d3.select('#zurich_hist')
    .append('svg')
    .attr('width', 470)
    .attr('height', 400)
    .append('g')
    .attr('transform', 'translate(' + 470/2 + ',' + 400/2 + ')');


//// Load the routes data and pass our drawRoutes method as the callback to be executed upon data load.
zurichDataManager.loadgeoJSON('/data/zurich/routes_topo.json', zurichMap.drawRoutes);

//Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
//zurichDataManager.loadgeoJSON('/data/zurich/stops_geo.json', zurichMap.drawStops);

zurichMap.on('routesEnd', function () {
    zurichDataManager.loadgeoJSON('/data/zurich/stops_geo.json', zurichMap.drawStops);
});

//Load our Zurich data, and supply the cleaning function.

zurichDataManager.loadCsvData('/data/zurich/zurich_delay.csv', function (d) {
    var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
    d.DELAY = +d.DELAY_MIN;
    delete d.DELAY_MIN;
    d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
    d.LATITUDE = +d.LATITUDE;
    d.LONGITUDE = +d.LONGITUDE;
    d.LOCATION = [d.LONGITUDE, d.LATITUDE];
});

zurichMap.addBrush();
//.on('brushing', function (brush) {
//    console.log(brush.extent());
//});

zurichMap.on('brushing', function (brush) {
    var filteredLocations = zurichDataManager.filterLocation(brush.extent()),
        delaysByHourAndLocation = zurichDataManager.getDelays(filteredLocations);

    //// Inspect the total number of events by hour;
    //console.log(delaysByHourAndLocation[0].group().all());
    //// Inspect the total number of delays by hour.
    //console.log(delaysByHourAndLocation[1].all());

    // Pass in our filtered delays to the radial histogram.
    zurichRadial.group(delaysByHourAndLocation[1]).dimension(delaysByHourAndLocation[0]);

    // Update radial chart with the new data.
    zurichHist.call(zurichRadial);
});


// sanFrancisco
var sanFranciscoMap = bdv.map()
    .center([-122.4376, 37.77])
    .scale(900000)
    .size([width, height]);

d3.select('#sanFrancisco_map')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(sanFranciscoMap);

sanFranciscoDataManager.loadgeoJSON('/data/san_francisco/routes_topo.json', sanFranciscoMap.drawRoutes);

sanFranciscoMap.on('routesEnd', function () {
    sanFranciscoDataManager.loadgeoJSON('/data/san_francisco/stops_geo.json', sanFranciscoMap.drawStops);
});


// geneva
var genevaMap = bdv.map()
    .center([6.14, 46.20])
    .scale(900000)
    .size([width, height]);

d3.select('#geneva_map')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(genevaMap);

genevaDataManager.loadgeoJSON('/data/geneva/routes_topo.json', genevaMap.drawRoutes);

genevaMap.on('routesEnd', function () {
    genevaDataManager.loadgeoJSON('/data/geneva/stops_geo.json', genevaMap.drawStops)
});
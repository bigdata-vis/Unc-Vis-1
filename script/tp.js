/**
 * Created by simba on 16/03/2016.
 */

var bdv = {};

// dataManager Module
bdv.dataManager = function module() {
    var exports = {},
        dispatch = d3.dispatch('geoReady', 'dataReady', 'dataLoading'),
        data;

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
        brush;

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
            .projection(projection)
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

    //Bind our custom events to the 'on' method of our function.
    d3.rebind(exports, dispatch, 'on');

    return exports;
};

var zurichDataManager = bdv.dataManager(),
    sanFranciscoDataManager = bdv.dataManager(),
    genevaDataManager = bdv.dataManager();

//zurichDataManager.loadCsvData('/data/zurich/zurich_delay.csv', function (d) {
//    var timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S %p');
//    d.DELAY = +d.DELAY_MIN;
//    delete d.DELAY_MIN;
//    d.SCHEDULED = timeFormat.parse(d.SCHEDULED);
//    d.LATITUDE = +d.LATITUDE;
//    d.LONGITUDE = +d.LONGITUDE;
//    d.LOCATION = [d.LONGITUDE, d.LATITUDE];
//});
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

//Zurich

var zurichMap = bdv.map()
    .center([8.5390, 47.3687])
    .scale(900000)
    .size([width, height]);

d3.select('#zurich_map')
    .append('svg').attr('width', width)
    .attr('height', height)
    .call(zurichMap);

//// Load the routes data and pass our drawRoutes method as the callback to be executed upon data load.
zurichDataManager.loadgeoJSON('/data/zurich/routes_topo.json', zurichMap.drawRoutes);

//Load the stops data and pass our drawStops method as the callback to be executed once the data loads.
//zurichDataManager.loadgeoJSON('/data/zurich/stops_geo.json', zurichMap.drawStops);

zurichMap.on('routesEnd', function () {
    zurichDataManager.loadgeoJSON('/data/zurich/stops_geo.json', zurichMap.drawStops);
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

genevaMap.on('routesEnd', function(){
   genevaDataManager.loadgeoJSON('/data/geneva/stops_geo.json', genevaMap.drawStops)
});
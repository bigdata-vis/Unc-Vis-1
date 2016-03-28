/**
 * Created by simba on 16/03/2016.
 */
d3.bdv = {};
d3.bdv.gradientChart = function module(){
    var svg,
        x,
        y;

    function exports (_selection){
        _selection.each(function (data) {
            var parseDate = d3.time.format("%Y%m%d").parse;

            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.time.scale()
                .range([0, width])
                //.domain([data[0].date, data[data.length - 1].date]);
                //.domain([new Date(data[0].date), d3.time.offset(new Date(data[data.length - 1]))]);
                //.domain([new Date('2011-10-01T12:00:00'), new Date('2012-09-01T12:00:00')]);
                .domain([new Date(), new Date()]);

            var y = d3.scale.linear()
                .range([height, 0])
                .domain(d3.extent(data, function(d) { return d.temperature; }));

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.temperature); });

            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            svg.append("linearGradient")
                .attr("id", "temperature-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0).attr("y1", y(50))
                .attr("x2", 0).attr("y2", y(60))
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "steelblue"},
                    {offset: "50%", color: "gray"},
                    {offset: "100%", color: "red"}
                ])
                .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Temperature (ºF)");

            svg.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", line);

        });
    }
    exports.xx = function(_x){
    };

    return exports
};


var graph = d3.bdv.gradientChart();
var parseDate = d3.time.format("%Y%m%d").parse;

//data processor
function datapro (){
    return d3.csv("data/temp.csv", function(error, data) {
        if (error) throw error;
        //
        data.forEach(function(d) {
            d.date = parseDate(d.date);
            d.temperature = +d.temperature;
        });
        console.log(data[0].date);
        console.log(data.length);
    })
}

data = datapro();

d3.select("#figure").datum(data).call(graph);
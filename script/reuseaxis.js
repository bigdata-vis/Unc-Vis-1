/**
 * Created by simba on 07/02/2016.
 */

d3.edge = {};

d3.edge.barChart = function module() {
    //margin for axis
    var margin = {left: 20, right: 20, top: 40, bottom: 40};

    var w = 500,
        h = 400,
        radius = 20,
        color = 'green';
    var dispatch = d3.dispatch('customHover');

    var svg,
        gap = 0,
        ease = 'bounce';

    function exports(_selection) {
        _selection.each(function (_data) {
            //width and height of the canvas
            var chartW = w - margin.left - margin.right,
                chartH = h - margin.top - margin.bottom;

            //code to draw x axis and y axis

            //horizontal axis
            var x1 = d3.scale.ordinal()
                .domain(_data.map(function (d, i) {
                    return i;
                }))
                .rangeRoundBands([0, chartW], 0.1);

            //vertical axis
            //var y1 = d3.scale.linear()
            //    .domain([0, d3.max(_data, function (d, i) {
            //        return d;
            //    })])
            //    .range([chartH, 0]);

            var y1 = d3.scale.linear()
                .domain([0, d3.max(_data, function (d, i) {
                    return d;
                })])
                .range([chartH, 0]);

            //instance of svg axis with y1 scale passed through them
            var xAxis = d3.svg.axis()
                .scale(x1)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y1)
                .orient("left");
                //.tickSize(6, 0);


            //single bar width to accomodate every value
            var barW = w / _data.length,
            //scaling the diagram height to the size of the largest value to fit into the screen
                scaling = h / d3.max(_data);

            if (!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .classed("chart", true);
                var canvas = svg.append("g").classed("container-group", true);
                canvas.append("g").classed("chart-group", true);
                canvas.append("g").classed("x-axis-group axis", true);
                canvas.append("g").classed("y-axis-group axis", true);
            }

            svg.transition().attr({
                width: w,
                height: h
            });

            svg.select('.container-group')
                .attr({
                    transform: "translate(" + margin.left + "," + margin.top + ")"
                });

            //x axis
            svg.select(".x-axis-group.axis")
                .transition()
                .ease(ease)
                .attr({transform: "translate(0," + chartH + ")"})
                .call(xAxis);

            //y axis
            svg.select(".y-axis-group.axis")
                .transition()
                .ease(ease)
                .call(yAxis);

            //padding on canvas
            var gapSize = x1.rangeBand() / 100 * gap;
            var barW = x1.rangeBand() - gapSize;

            //enter, update, exit on bars
            var bars = svg.select(".chart-group")
                .selectAll(".bar")
                .data(_data);

            //   dynamic data source
            //   var bars = svg.select(".chart-group")
            //       .selectAll(".bar")
            //       .data(function(d, i){
            //           return d;
            //       });

            bars.enter().append("rect")
                .classed("bar", true)
                .attr({
                    x: chartW,
                    width: barW,
                    y: function (d, i) {
                        return y1(d);
                    },

                    height: function (d, i) {
                        return chartH - y1(d);
                    },
                    fill: color,
                    stroke: 'white'
                })
                .on("mouseover", dispatch.customHover);

            bars.transition()
                .ease(ease)
                .attr({
                    width: barW,
                    x: function (d, i) {
                        return x1(i) + gapSize / 2;
                    },
                    y: function (d, i) {
                        return y1(d);
                    },
                    height: function (d, i) {
                        return chartH - y1(d);
                    }
                });

            //bars.enter()
            //    .append('rect')
            //    .classed('bar', true)
            //    .attr({
            //        x: w,
            //        width: barW,
            //        y: function (d, i) {
            //            return y1(d);
            //        },
            //        height: function (d, i) {
            //            return chartH - y1(d);
            //        },
            //        fill: color,
            //        stroke: 'white'
            //    })
            //    .on('mouseover', dispatch.customHover);

            //
            //bars.transition()
            //    .each(ease)
            //    .attr({
            //        x: function (d, i) {
            //            return x1(d) + gapSize / 2;
            //        },
            //        y: function (d, i) {
            //            return y1(d);
            //        },
            //        width: barW,
            //        height: function (d, i) {
            //            return chartH - y1(d);
            //        }
            //    });

            bars.exit()
                .transition()
                .style({opacity: 0})
                .remove();
        })
    }

    exports.w = function (_x) {
        if (!arguments.length) return w;
        w = _x;
        return this;
    };

    exports.h = function (_x) {
        if (!arguments.length) return h;
        h = _x;
        return this;
    };

    exports.rad = function (_x) {
        if (!arguments.length) return radius;
        radius = _x;
        return this;
    };

    exports.c = function (_x) {
        if (!arguments.length) return color;
        color = _x;
        return this;
    };

    d3.rebind(exports, dispatch, 'on');
    return exports
};


// Uncertainty Ranger
/////////////////////////////////
var ucbar = d3.select('.ucbar')
    .append('svg')
    .attr({
        height: 30,
        width: 190
    })
    .append('g');

var square = ucbar.append('rect')
    //.attr('x', 80)
    .attr('y', 5)
    .attr('height', 30)
    .attr('width', 190)
    .attr('fill', 'red')
    .text('Uncertainty Gauge');

var color = d3.scale.linear()
    .domain([-1, 0, 1, 2])
    .range(["red", "yellow", "green"]);

//color(-1)   // "#ff0000" red
//color(-0.5) // "#ff8080" pinkish
//color(0)    // "#ffffff" white
//color(0.5)  // "#80c080" getting greener
//color(0.7)  // "#4da64d" almost there..
//color(1)    // "#008000" totally green!


var chart = d3.edge.barChart()
    .w(1000)
    .h(550)
    .c("orange")
    .on('customHover', function (d, i) {
        d3.select('.message').text(d);
        //square.attr('fill', color(Math.random() * 2))
        square.attr('fill', color(Math.random() * 2))
    });

function update() {
    var data = randomDataset();
    d3.select("#figure")
        .datum(data)
        .call(chart);
}

function randomDataset() {
    return d3.range(~~(Math.random() * 50)).map(function (d, i) {
        return ~~(Math.random() * 1000);
    });
}

update();

//setInterval(update, 20000);


////usage
//
//var barChart = d3.edge.barChart()
//    .w(500)
//    .h(400)
//    .c('orange')
//    .on('customHover', function (d, i) {
//        d3.select('.message').text(d);
//    });
//
//var barChart2 = d3.edge.barChart()
//    .w(500)
//    .h(400)
//    .c('purple')
//    .on('customHover', function (d, i) {
//        d3.select('.message').text(d);
//    });


////var data1 = [100, 40, 10, 80, 60];
//var container = d3.select(".chart")
//    .datum(randomDataset())
//    .call(barChart);
//
//function updateData() {
//    var data = randomDataset();
//    container.datum(data)
//        .call(barChart);
//
//    var data2 = randomDataset();
//    d3.select('.chart2')
//        .datum(data2)
//        .call(barChart2);
//}
//
//function randomDataset() {
//    return d3.range(Math.floor(Math.random() * 50) + 1).map(function (d, i) {
//        //console.log(d3.range(Math.floor(Math.random() * 10) + 1));
//        return Math.floor(Math.random() * 1000);
//    })
//}
//
////call updateData function
//updateData();
//setInterval(updateData, 5000);

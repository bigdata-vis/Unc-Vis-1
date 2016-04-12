/**
 * Created by simba on 07/02/2016.
 */

d3.edge = {};

d3.edge.barChart = function module() {

    var w = 500,
        h = 400,
        radius = 20,
        color = 'green';
    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function (_data) {

            //single bar width to accomodate every value
            var barW = w / _data.length,
            //scaling the diagram height to the size of the largest value to fit into the screen
                scaling = h / d3.max(_data);

            var svg = d3.select(this)
                .selectAll('svg')
                .data([_data]);

            svg.enter().append('svg')
                .classed("chart", true);

            svg.transition().attr({
                width: w,
                height: h
            });

            //enter, update, exit on bars
            var bars = svg.selectAll(".bar")
                .data(function (d, i) {
                    return d;
                });
            bars.enter()
                .append('rect')
                .classed('bar', true)
                .attr({
                    x: w,
                    width: barW,
                    y: function (d, i) {
                        return h - d * scaling;
                    },
                    height: function (d, i) {
                        return d * scaling;
                    },
                    fill: color,
                    stroke: 'white'
                })
                .on('mouseover', dispatch.customHover);

            bars.transition()
                .attr({
                    x: function (d, i) {
                        return i * barW;
                    },
                    y: function (d, i) {
                        return h - d * scaling;
                    },
                    width: barW,
                    height: function (d, i) {
                        return d * scaling;
                    }
                });

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

//usage

var barChart = d3.edge.barChart()
    .w(500)
    .h(400)
    .c('orange')
    .on('customHover', function (d, i) {
        d3.select('.message').text(d);
    });

var barChart2 = d3.edge.barChart()
    .w(500)
    .h(400)
    .c('purple')
    .on('customHover', function (d, i) {
        d3.select('.message').text(d);
    });


//var data1 = [100, 40, 10, 80, 60];
var container = d3.select(".chart")
    .datum(randomDataset())
    .call(barChart);

function updateData() {
    var data = randomDataset();
    container.datum(data)
        .call(barChart);

    var data2 = randomDataset();
    d3.select('.chart2')
        .datum(data2)
        .call(barChart2);
}

function randomDataset() {
    return d3.range(Math.floor(Math.random() * 50) + 1).map(function (d, i) {
        //console.log(d3.range(Math.floor(Math.random() * 10) + 1));
        return Math.floor(Math.random() * 1000);
    })
}

//call updateData function
updateData();
setInterval(updateData, 5000);

//function updateWith() {
//
//}

//
//
////version 1
//var data1 = [100, 40, 10, 80, 60];
//var barChart1 = d3.edge.barChart().w(500).h(400).c('blue')
//    .on("customHover", function (d, i) {
//        msg("chart value : " + d);
//    });
//
//d3.select(".chart")
//    .datum(data1)
//    .call(barChart1);

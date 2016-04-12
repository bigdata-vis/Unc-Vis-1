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

            d3.select(this)

                .append('svg')
                .attr({
                    class: "chart2",
                    width: w,
                    height: h
                })
                .append('g')
                .selectAll('.bar')
                .data(_data)
                .enter()

                //.append('circle')
                //.attr({
                //    class: 'bar',
                //    cx: function (d, i) {
                //        return i * barW + radius
                //    },
                //    cy: function (d, i) {
                //        return h - d * scaling + radius
                //    },
                //    r: radius,
                //    fill: color
                //})

                .append('rect')
                .attr({
                    class: 'bar',
                    x: function (d, i) {
                        return i * barW;
                    },
                    y: function (d, i) {
                        return h - d * scaling;
                    },
                    width:barW,
                    height: function (d, i) {
                        return d * scaling;
                    },
                    fill: color,
                    stroke: 'white'
                })
                .on('mouseover', dispatch.customHover)
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


var msg = (function () {
    var selection = d3.select(".message");
    return function (text_message) {
        selection.text(text_message);
    };
})();

//version 1
var data1 = [100, 40, 10, 80, 60];
var barChart1 = d3.edge.barChart().w(500).h(400).c('blue')
    .on("customHover", function (d, i) {
        msg("chart value : " + d);
    });

d3.select(".chart")
    .datum(data1)
    .call(barChart1);

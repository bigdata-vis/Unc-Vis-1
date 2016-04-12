/**
 * Created by simba on 15/01/2016.
 */
var bardata="letter,frequency\nA,0.89\nB,0.71\nC,0.45";

//styling
var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, .2);

var y = d3.scale.linear()
    .range([height, 0]);


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

letters = d3.csv.parse(bardata, function(d) {
    return {
        letter: d.letter,
        frequency: +d.frequency
    };
});

//letters = d3.csv("script/bardata.csv", function (d) {
//    return {
//        letter: d.letter,
//        frequency: +d.frequency
//    }
//});

x.domain(letters.map(function (d) {
    return d.letter;
}));
y.domain([0, d3.max(letters, function (d) {
    return d.frequency;
})]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(x).orient("bottom"));

svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

svg.selectAll(".bar")
    .data(letters)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
        return x(d.letter);
    })
    .attr("width", x.rangeBand())
    .attr("y", function (d) {
        return y(d.frequency);
    })
    .attr("height", function (d) {
        return height - y(d.frequency);
    });
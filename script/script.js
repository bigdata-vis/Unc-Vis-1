/**
 * Created by simba on 12/01/2016.
 */
var data = [4, 8, 15, 16, 23, 42];
var dataTitle = ['text', 'text', 'text', 'text', 'text'];
//
var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([20, width]);

var chart = d3.select(".chart")
    .attr("width", width)
    .attr("height", barHeight * data.length);
//console.log(data.length);
//
var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d, i) {
        //console.log(d);
        //console.log(i);
        return "translate(0," + i * barHeight + ")";
    });

bar.append("rect")
    .attr("width", x)
    .attr("height", barHeight - 1);

bar.append("text")
    .attr("x", function (d) {
        return x(d) - 3;
    })
    .attr("y", function () {
        //console.log((barHeight - 1) / 2);
        return (barHeight - 1) / 2;
    })
    .attr("dy", function () {
        //console.log((barHeight) / 3);
        return (barHeight - 1 ) / 5;
    })
    .text(function (d) {
        return d;
    });


//title
bar.append("text")
    //.attr("x", '80')
    .attr("x", function (d) {
        console.log(x(d));
        return x(d) + 35;
    })
    //.attr("x", function (d) {
    //    console.log(x(d));
    //    return 35;
    //})
    .attr("y", function () {
        return (barHeight - 1) / 2;
    })
    .text(function (d) {
        return 'title ' + d;
    })
    .style("fill", "steelblue")
    .attr("dy", function () {
        //console.log((barHeight) / 3);
        return (barHeight - 1 ) / 5;
    });


// 1. Code here runs first, before the download starts.

//d3.tsv("data.tsv", function (error, data) {
//    // 3. Code here runs last, after the download finishes.
//});

// 2. Code here runs second, while the file is downloading.


//Year,Make,Model,Length
//1997,Ford,E350,2.34
//2000,Mercury,Cougar,2.38

//d3.csv("script/data.csv")
//    .row(function (d) {
//        return {
//            year: new Date(+d.Year, 0, 1),
//            make: d.Make,
//            model: d.Model,
//            length: d.Length
//        };
//    })
//    .get(function (error, rows) {
//        console.log(rows);
//    });

d3.csv("data/data.csv", function (d) {
    return {
        name: d.Name, // convert "Year" column to Date
        points: +d.Value
    };
}, function (error, rows) {
    console.log(rows);
});
/**
 * Created by simba on 07/02/2016.
 */

d3.edge = {};

d3.edge.table = function module() {
    var fontSize = 10,
        fontColor = 'red';
    var dispatch = d3.dispatch('customHover');

    function exports(_selection) {
        _selection.each(function (_data) {
            d3.select(this)
                .append('div')
                .style('font-size', fontSize + 'px')
                .style('color', fontColor)
                .html("Hello Saminu " + _data)
                //.on('mouseover', function (d, i) {
                //    return dispatch.customHover(d, i)
                //})
                .on('mouseover', dispatch.customHover);
        })
    }

    exports.fontSize = function (_x) {
        if (!arguments.length) return fontSize;
        fontSize = _x;
        return this
    };

    exports.fontColor = function (_x) {
        if (!arguments.length) return fontColor;
        fontColor = _x;
        return this
    };

    d3.rebind(exports, dispatch, 'on');
    return exports
};

//show message
function message(d, i) {
    d3.select('.message').html("The value of this box " + d )
}

var table = d3.edge.table().fontSize('30').fontColor('green');
table.on('customHover', message);


var dataset = [1, 2, 3, 4, 9];
d3.select('.chart')
    .datum(dataset)
    .call(table);


var dataset2 = [10, 22, 34, 46, 98];
d3.select('.chart2')
    .datum(dataset2)
    .call(table);
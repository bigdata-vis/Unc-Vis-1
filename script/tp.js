/**
 * Created by simba on 16/03/2016.
 */

var bdv = {};

bdv.dataManager = function module(){
    var exports = {},
        dispatch = d3.dispatch('geoReady','dataReady','dataLoading'),
        data;

    exports.loadCsvData = function(_file, _cleaningFunc){
        var loadCsv = d3.csv(_file);

        loadCsv.on('progress', function(){
           dispatch.dataLoading(d3.event.loaded);
        });

        loadCsv.get(function(_err, _response){

            _response.forEach(function(d){
                _cleaningFunc(d)
            });
            data = _response;

            dispatch.dataReady(_response);
        });
    };

    exports.getCleanedData = function(){
        return data
    };

    d3.rebind(exports, dispatch, 'on');
    return exports;
};

var zurichDataManager = bdv.dataManager(),
    sanFranciscoDataManager = bdv.dataManager(),
    genevaDataManager = bdv.dataManager();

zurichDataManager.loadCsvData('/data/zurich/zurich_delay.csv', function(d){

});

sanFranciscoDataManager.loadCsvData('/data/san_francisco/san_francisco_delay.csv', function(d){

});

genevaDataManager.loadCsvData('/data/geneva_delay_coord.csv', function(d){

});
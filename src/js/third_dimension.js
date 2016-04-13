/************************************************************************************/
// 3D projection - visualizations

// initialize the global application variable
var Application = Application || {};

// initialize the one dimension visualization object
Application.thirdDV = Application.thirdDV || {};

(function(){
    
    Application.thirdDV = 
    {
        draw3rdProteinCurve: function (data, pMax, time) {
            var headerRow_twoD = Object.keys(data[0]);  // get keys from the first row
            var xMax = d3.max(data, function (d) { return +d[headerRow_twoD[1]]; });
            var yMax = d3.max(data, function (d) { return +d[headerRow_twoD[0]]; });

            for (var i = 0; i <= yMax; i++) {
                for (var j = 0; j <= xMax; j++) {

                }
            }
        }
    }

})();
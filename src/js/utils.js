/************************************************************************************/
// Utilities

// initialize the global application variable
var Application = Application || {};

// initialize the one dimension visualization object
Application.utils = Application.utils || {};

(function(){

    Application.utils =
    {
        // find max prob in the entire file (over time)
        findMax: function (data, headerRow, shift) {
            var max = 0;
            for (var i = 0; i < Application.TimeStep; i++) {
                var temp =  d3.max(data, function (d) { return +d[headerRow[i+shift]]; });
                if (max < temp) {
                    max = temp;
                }
            }
            return max;
        },

        // find peaks of each specie of proteins at current time
        findPeaks :  function (data, rows, shift) {
            var peaks = [];
            var peak_num = 0;
            if (+d3.values(data[0])[Application.currentTime+shift]
                    >= +d3.values(data[1])[Application.currentTime+shift]) {
                peaks.push({count:0, value: 0});
                peak_num++;
            }
            for (var i = 1; i <= rows-1; i++) {
                var row_value_left = d3.values(data[i-1]);
                var row_value_middle = d3.values(data[i]);
                var row_value_right = d3.values(data[i+1]);
                if (+row_value_middle[Application.currentTime+shift] >= +row_value_left[Application.currentTime+shift]
                    && +row_value_middle[Application.currentTime+shift] >= +row_value_right[Application.currentTime+shift]) {
                    peaks.push({count:i, value:row_value_middle[Application.currentTime+shift]});
                    peak_num++;
                }
            }
            if (+d3.values(data[rows])[Application.currentTime+shift] >= +d3.values(data[rows-1])[Application.currentTime+shift]) {
                peaks.push(rows);
                peak_num++;
            }
            return peaks;
            //return peak_num;
        },
        
        // convert the data to the format used in Plotly
        convert4plotly :  function (data, rows, columns, shift) {
            var prob = [];
            for (var i=0; i<rows; i++) {
                var prob_row = [];
                for (var j = 0; j < columns; j++) {                     
                    prob_row.push(d3.values(data[i*columns+j])[Application.currentTime+shift]); 
                }
                prob.push(prob_row);
            }
            var data_new = {z: prob, colorscale: [[0, '#F2E1D9'], [1, '#F95706']], type: 'surface'};
            return data_new;
        }
    };


})();
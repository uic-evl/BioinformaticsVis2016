// Main application variable
var Application = Application ||  {};

//
(function()
{
    Application.body = document.body;
    Application.html = document.documentElement;

    Application.outerWidth = document.getElementsByTagName('body')[0].clientWidth;

    Application.margin = 25;

    Application.protein_type = 3;
    Application.gene_type = 5;
    Application.TimeStep = 21;
    Application.currentTime = 10;

    Application.shiftX = 55;
    Application.shiftY = 25;

    Application.clickedPaIndex = -1;
    Application.clickedPbIndex = -1;
    Application.clickedPcIndex = -1;

    Application.data = {};
    Application.timeSlider = null;

    // Control Panel Variables
    Application.show_projectionOneD = true;
    Application.show_projectionTwoD = false;
    Application.show_projectionTwoD_Pab = false;
    Application.show_projectionTwoD_Pac = false;
    Application.show_projectionTwoD_Pbc = false;
    Application.show_projectionTwoD_time = false;
    Application.show_projectionOneD_time = false;
    Application.show_projectionTwoD_3rdP = false;
    Application.show_projectionThreeD = false;
    Application.show_peaks = false;
    Application.show_detailTwoD = false;
    Application.show_qualitative = false;
    Application.show_animation = false;
})();

/************************************************************************************/
function start() {

    /**** Window Height ****/
    Application.outerHeight = Math.max( Application.body.scrollHeight || 0, Application.body.offsetHeight ||0,
        Application.html.clientHeight || 0, Application.html.scrollHeight || 0, Application.html.offsetHeight ||0 );

    /**** Main View Height and Width ****/
    Application.main_width = (Application.outerWidth - Application.margin*3) * 5 / 6;
    Application.main_height =  (Application.outerHeight - Application.margin * 2) / 2.5 ;

    /**** 1D Container ****/
    var prob_div = d3.select("#probability");

    var oneD_svg = prob_div
        .attr("width",  prob_div.node().parentNode.clientWidth - Application.margin)
        .attr("height", Application.main_height - Application.margin * 3)
        .append('g');

    /**** 2D Containers ****/
    var heatmapAB_div = d3.select("#heatmapAB");
    var heatmapAC_div = d3.select("#heatmapAC");
    var heatmapBC_div = d3.select("#heatmapBC");

    var pAB = Application.twoDV();
    var pBC = Application.twoDV();
    var pAC = Application.twoDV();

    var twoD_AB_svg = heatmapAB_div
        .attr("width",  heatmapAC_div.node().parentNode.clientWidth - Application.margin)
        .attr("height", Application.main_height - Application.margin * 2)
        .append("g");

    var twoD_AC_svg = heatmapAC_div
        .attr("width",  heatmapAC_div.node().parentNode.clientWidth - Application.margin)
        .attr("height", Application.main_height - Application.margin * 2)
        .append("g");

    var twoD_BC_svg = heatmapBC_div
        .attr("width",  heatmapBC_div.node().parentNode.clientWidth - Application.margin)
        .attr("height", Application.main_height - Application.margin * 2)
        .append("g");

    /*** Set 3D layout ***/

    var layout = {
        height: Application.main_height - Application.margin * 2,
        scene: {
            xaxis: {
                title: "Temp"
            },
            yaxis: {
                title: "Temp"
            },
            zaxis: {
                title: "Temp"
            }
        },

        margin: {
            t: 20
        }
    };

    var AB3d = document.getElementById('plotyly3dAB');
    var AC3d = document.getElementById('plotyly3dAC');
    var BC3d = document.getElementById('plotyly3dBC');

    /************************************************************************************/


    /************************************************************************************/
    // load multiple files and draw
    queue()
        .defer(d3.csv, "./data/Pa_t0-20.csv")
        .defer(d3.csv, "./data/Pb_t0-20.csv")
        .defer(d3.csv, "./data/Pc_t0-20.csv")
        .defer(d3.csv, "./data/Pab_t0-20.csv")
        .defer(d3.csv, "./data/Pac_t0-20.csv")
        .defer(d3.csv, "./data/Pbc_t0-20.csv")
        .defer(d3.csv, "./data/Pabc_t0-20.csv")
        .defer(d3.csv, "./data/state_space.csv")
        .await(loadAll);

    function loadAll(error, Pa_t20, Pb_t20, Pc_t20, Pab_t20, Pac_t20, Pbc_t20, Pabc_t20, States) {
        if (error) {
            console.log(error);
        }

        /* save the data in the global context to avoid passing it around */
        Application.data["Pa"] = Pa_t20;//_.slice(Pa_t20, 0, Application.TimeStep);
        Application.data["Pb"] = Pb_t20;//_.slice(Pb_t20, 0, Application.TimeStep+1);
        Application.data["Pc"] = Pc_t20;//_.slice(Pc_t20, 0, Application.TimeStep+1);

        /* Get the minimum number of molecules for each axis */
        var minX = Math.min(Application.data["Pa"].length, Application.data["Pb"].length);
        var minY = Math.min(Application.data["Pb"].length, Application.data["Pc"].length);

        /* Map the data into the same size range */
        Application.data["Pab"] =  _.reduce(Pab_t20,
            function(result, value, key){
                if( value["ProteinA"] < minX && value["ProteinB"] < minY)
                {
                    result.push(value);
                }
                return result;
            }, []);

        Application.data["Pac"] = _.reduce(Pac_t20,
            function(result, value, key){
                if( value["ProteinA"] < minX && value["ProteinC"] < minY)
                {
                    result.push(value);
                }
                return result;
            }, []);

        Application.data["Pbc"] = _.reduce(Pbc_t20,
            function(result, value, key){
                if( value["ProteinB"] < minX && value["ProteinC"] < minY)
                {
                    result.push(value);
                }
                return result;
            }, []);

        Application.data["Pabc"] = Pabc_t20;

        var headerRow_oneD = Object.keys(Pa_t20[0]);  // get keys from the first row
        var headerRow_twoD = Object.keys(Pab_t20[0]);  // get keys from the first row
        var headerRow_threeD = Object.keys(Pabc_t20[0]);

        var xMaxP = [];
        xMaxP[0] = d3.max(Pa_t20, function (d) { return +d[headerRow_oneD[0]]; });
        xMaxP[1] = d3.max(Pb_t20, function (d) { return +d[headerRow_oneD[0]]; });
        xMaxP[2] = d3.max(Pc_t20, function (d) { return +d[headerRow_oneD[0]]; });

        var xMax_oneD = d3.max(xMaxP);
        var yMax_oneD = d3.max([Application.utils.findMax(Pa_t20, headerRow_oneD, 1),
                Application.utils.findMax(Pc_t20, headerRow_oneD, 1),
                Application.utils.findMax(Pc_t20, headerRow_oneD, 1)]) + 0.01;

        var probMax2D = d3.max([Application.utils.findMax(Pab_t20, headerRow_twoD, 2),
                Application.utils.findMax(Pac_t20, headerRow_twoD, 2),
                Application.utils.findMax(Pbc_t20, headerRow_twoD, 2)]) + 0.01;

        var probMax3D = Application.utils.findMax(Pabc_t20, headerRow_threeD, 3);


        /*******Initialization*********/

        // 1D projection
        Application.oneDV.initialize(oneD_svg);

        pAB.initialize(twoD_AB_svg, 'Pab');
        pBC.initialize(twoD_AC_svg, 'Pbc');
        pAC.initialize(twoD_BC_svg, 'Pac');

        var plotlyPab = Application.utils.convert4plotly(Pab_t20, Pa_t20.length, Pb_t20.length, 2);
        var plotlyPac = Application.utils.convert4plotly(Pac_t20, Pa_t20.length, Pc_t20.length, 2);
        var plotlyPbc = Application.utils.convert4plotly(Pbc_t20, Pb_t20.length, Pc_t20.length, 2);
        /************************************************************************************/

        /************************************************************************************/
        // time slider
        var startingTime = 0;
        Application.currentTime = 0;

        function toggleLines(evt)
        {
            var selector = "path:not(.time" + Application.currentTime + ")";

            // only show the line corresponding to the
            // current time step
            if(Application.show_projectionOneD_time)
            {
                prob_div.selectAll(selector)
                    .style('visibility', 'hidden');
            }
            // reset and show all the lines
            else {
                prob_div.selectAll('path')
                    .style('visibility', 'visible');
            }
        }

        function brushed(evt, value) {

            Application.currentTime = value;
            Application.oneDV.renderLineGraphs(headerRow_oneD);
            Application.oneDV.renderOneDHeatMaps(headerRow_oneD, probMax3D, xMaxP, xMax_oneD, yMax_oneD);
            Application.oneDV.drawPeaks(xMaxP, probMax3D);

            pAB.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
            pBC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
            pAC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);

            if(Application.show_projectionOneD_time)
            {
                prob_div.selectAll('path')
                    .style('visibility', 'visible');

                toggleLines(evt);
            }

            /************* 3D Surface Plots ********************************************/
            var plotlyPab = Application.utils.convert4plotly(Pab_t20, Pa_t20.length, Pb_t20.length, 2);
            var plotlyPac = Application.utils.convert4plotly(Pac_t20, Pa_t20.length, Pc_t20.length, 2);
            var plotlyPbc = Application.utils.convert4plotly(Pbc_t20, Pb_t20.length, Pc_t20.length, 2);

            /* update the data and redraw */
            AB3d.data = [plotlyPab];
            AB3d.layout.scene = {xaxis: {title: "ProteinB"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."} };
            Plotly.redraw(AB3d, AB3d.layout);

            AC3d.data = [plotlyPac];
            AC3d.layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."} };
            Plotly.redraw(AC3d, AC3d.layout);

            BC3d.data = [plotlyPbc];
            BC3d.layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinB"}, zaxis: {title: "Prob."} };
            Plotly.redraw(BC3d, BC3d.layout);
        }

        /***** Setup the time slider ****/
        Application.timeSlider =
            d3.slider()
            .axis(d3.svg.axis().ticks(Application.TimeStep))
            .min(startingTime)
            .max(Application.TimeStep)
            .step(1)
            .on("slideend", brushed);

         d3.select('#timeSlider')
            .call(Application.timeSlider);

        // show the labels
        d3.selectAll('h3').style({visibility: 'visible'});
        d3.selectAll('h4').style({visibility: 'visible'});
        d3.selectAll('hr').style({visibility: 'visible'});

        var buttons = d3.select("#buttons").style({visibility: 'visible'})
            .selectAll('input')
            .on('change', function(evt){

                if(this.name == 'timeCurves')
                {
                    // flip the state
                    Application.show_projectionTwoD_time = !Application.show_projectionTwoD_time;

                    pAB.showCurves("Pab");
                    pBC.showCurves("Pbc");
                    pAC.showCurves("Pac");

                }
                else if(this.name == 'currentTime')
                {
                    Application.show_projectionOneD_time = !Application.show_projectionOneD_time;
                    toggleLines(evt);
                }
                else if(this.name == "heatmap")
                {
                    // flip the state of the rendering type
                    Application.show_qualitative = !Application.show_qualitative;

                    pAB.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
                    pBC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
                    pAC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
                }
                else if(this.name == 'animation')
                {
                    Application.show_animation = !Application.show_animation;
                }

            });

        function frame() {
            if (Application.show_animation) {
                Application.currentTime = (Application.currentTime+1) % Application.TimeStep;

                // update the timeSlider with the change
                Application.timeSlider.value(Application.currentTime);

                pAB.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
                pBC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);
                pAC.update2DHeatMap(Application.currentTime, colorbrewer.Set1["4"]);

                var plotlyPab = Application.utils.convert4plotly(Pab_t20, Pa_t20.length, Pb_t20.length, 2);
                var plotlyPac = Application.utils.convert4plotly(Pac_t20, Pa_t20.length, Pc_t20.length, 2);
                var plotlyPbc = Application.utils.convert4plotly(Pbc_t20, Pb_t20.length, Pc_t20.length, 2);

                /* update the data and redraw */
                AB3d.data = [plotlyPab];
                AB3d.layout.scene = {xaxis: {title: "ProteinB"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."} };
                Plotly.redraw(AB3d, AB3d.layout);

                AC3d.data = [plotlyPac];
                AC3d.layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."} };
                Plotly.redraw(AC3d, AC3d.layout);

                BC3d.data = [plotlyPbc];
                BC3d.layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinB"}, zaxis: {title: "Prob."} };
                Plotly.redraw(BC3d, BC3d.layout);
            }
        }
        var id = setInterval(frame, 100); // draw every 100ms

        /************************ Initial Render *********************************/
        Application.oneDV.drawAxis(xMax_oneD, yMax_oneD);  // draw X/Y-axis

        Application.oneDV.renderLineGraphs(headerRow_oneD);
        Application.oneDV.renderOneDHeatMaps(headerRow_oneD, probMax3D, xMaxP, xMax_oneD, yMax_oneD);
        Application.oneDV.drawPeaks(xMaxP, probMax3D);

        pAB.draw2DHeatMap("Pab" ,probMax2D, Application.currentTime);
        pAC.draw2DHeatMap("Pac", probMax2D, Application.currentTime);
        pBC.draw2DHeatMap("Pbc", probMax2D, Application.currentTime);

        /************* 3D Surface Plots ********************************************/

        layout.scene = {xaxis: {title: "ProteinB"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."},
            camera: { eye: { x: -1.25, y: -1.25, z: 2 } } };
        Plotly.newPlot(AB3d, [plotlyPab], layout, {displayModeBar: false});

        layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinA"}, zaxis: {title: "Prob."},
            camera: { eye: { x: -1.25, y: -1.25, z: 2 } }};
        Plotly.newPlot(AC3d, [plotlyPac], layout, {displayModeBar: false});

        layout.scene = {xaxis: {title: "ProteinC"}, yaxis: {title: "ProteinB"}, zaxis: {title: "Prob."},
            camera: { eye: { x: -1.25, y: -1.25, z: 2 } }};
        Plotly.newPlot(BC3d, [plotlyPbc], layout, {displayModeBar: false});

    }  // end - loadAll()
}
/************************************************************************************/
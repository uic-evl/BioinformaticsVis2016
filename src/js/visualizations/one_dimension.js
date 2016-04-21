/************************************************************************************/
// 1D projection - visualizations

// initialize the global application variable
var Application = Application || {};

// initialize the one dimension visualization object
Application.oneDV = Application.oneDV || {};

(function(){
    
    var lineGraphWidth = -1;// Application.main_width * 3 / 5;
    var lineGraphHeight = -1;//Application.main_height / 2;

    var xAxisLabelText = "Number of Proteins";
    var yAxisLabelText = "Probability";
    var xScale = null;//d3.scale.linear().range([0, lineGraphWidth]);
    var yScale = null;//d3.scale.linear().range([lineGraphHeight, 0]);

    // group all the objects in the main view

    var projectionOneD = null;

    var projectionOneD_peaks = null;

    var heatMap = null;

    Application.oneDV = {

        initialize : function(main) {

            lineGraphWidth = main.node().parentNode.clientWidth - 5 * Application.margin;
            lineGraphHeight = Application.main_height / 1.5;

            xScale = d3.scale.linear().range([0, lineGraphWidth]);
            yScale = d3.scale.linear().range([lineGraphHeight, 0]);

            projectionOneD = main.append("g")
                .attr("transform", "translate(" + Application.shiftX + "," + Application.shiftY + ")");

            heatMap = d3.select("#distribution1D")
                .attr("width", lineGraphWidth)
                .attr("height", lineGraphHeight / 2);

            // locations of states
            projectionOneD_peaks = main.append("g")
                .attr("width", lineGraphWidth - Application.margin)
                .attr("height", lineGraphHeight / 2)
                .attr("transform", "translate(" + (lineGraphWidth + Application.shiftX*2) + ", 0)");
//                    + "," + Application.shiftY + ")");
        },

        // Accessor to obtain the 1D projection
        getProjection: function() { return projectionOneD },

        // Accessor to obtain the 1D peaks
        getPeaks: function(){ return projectionOneD_peaks },

        // draw x/y-axis
        drawAxis: function(xMax, yMax) {

            var chartHeight = lineGraphHeight;

            xScale.domain([0, xMax]);
            yScale.domain([0, yMax]);

            var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
            var yAxis = d3.svg.axis().scale(yScale).orient("left");

            var xAxisG = projectionOneD.append("g")
                .attr("transform", "translate(0," + chartHeight + ")")
                .attr("class", "x axis");

            var yAxisG = projectionOneD.append("g")
                .attr("class", "y axis");

            xAxisG.call(xAxis);
            yAxisG.call(yAxis);

            var xAxisLabel = xAxisG.append("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + (lineGraphWidth/2) + "," + Application.shiftY*2 + ")")
                .attr("class", "label")
                .text(xAxisLabelText);

            var yAxisLabel = yAxisG.append("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + 0 + "," + (-5) + ")")
                .attr("class", "label")
                .text(yAxisLabelText);

            var legend = projectionOneD.append("g");
            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY)
                .attr("stroke", d3.hsl(5, 0.9, 0.55));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(5, 0.9, 0.55))
                .text("Protein A");

            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY*2)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY*2)
                .attr("stroke", d3.hsl(105, 0.9, 0.55));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY*2 + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(105, 0.9, 0.55))
                .text("Protein B");

            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY*3)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY*3)
                .attr("stroke", d3.hsl(225, 0.9, 0.55));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY*3 + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(225, 0.9, 0.55))
                .text("Protein C");
        },

        // draw line plots
        drawLineGraph : function(data, xColumn, yColumn, color) {

            var line = d3.svg.line().x(function (d) { return xScale(d[xColumn]); })
                .y(function (d) { return yScale(d[yColumn]); });

            var lineGraph = projectionOneD.append("path");
            lineGraph.attr("d", line(data)).attr("stroke", color).attr("stroke-width", "2px");
            //lineGraph.exit().remove();
        },


        drawHeatMaps: function(data, xMax, yMax, xColumn, yColumn, yPos, width, height, p, data2,
                               probMax, maxProtein, xPeakPos, length) {

            var clickedIndex = -1;
            xScale.domain([0, xMax]);

            var new_group = heatMap.append("g");

            // var new_group = projectionOneD.append("g");
            var bars = new_group.selectAll("rect").data(data);

            bars.enter().append("rect")
                .attr("y", yPos)
                .attr("width", width)
                .attr("height", height)
                .attr("class", "HeatMap");

            bars.attr("x", function (d) { return width*d[xColumn]; })
                .attr("fill", function (d) {
                    return d3.hsl(20, 0.5+0.45*d[yColumn]/yMax, 0.5+0.45*(yMax-d[yColumn])/yMax);
                    //return d3.hsl(20, 0.9, 0.5);
                })
                .on("click", function (d) {
                    switch (p) {
                        case 0:
                            Application.clickedPaIndex = +d[xColumn];
                            clickedIndex = Application.clickedPaIndex;
                            break;
                        case 1:
                            Application.clickedPbIndex = +d[xColumn];
                            clickedIndex = Application.clickedPbIndex;
                            break;
                        case 2:
                            Application.clickedPcIndex = +d[xColumn];
                            clickedIndex = Application.clickedPcIndex;
                            break;
                        default:
                            break;
                    }
                    console.log("Pa clicked: " + Application.clickedPaIndex);
                    console.log("Pb clicked: " + Application.clickedPbIndex);
                    console.log("Pc clicked: " + Application.clickedPcIndex);

                    // highlight the selected bar
                    if (clickedIndex != -1) {
                        var sBar = new_group.append("rect");
                        sBar.attr("x", width*clickedIndex)
                            .attr("y", yPos - height/4)
                            .attr("width", width)
                            .attr("height", height*3/2)
                            .attr("fill", "none")
                            .style("fill-opacity", 0.1)
                            .attr("stroke", "black");
                    }

                    if (Application.clickedPaIndex != -1 && Application.clickedPbIndex != -1 && Application.clickedPcIndex != -1) {
                        Application.show_peaks = false;
                        projectionOneD_peaks.selectAll("*").remove();

                        var peaks = [];
                        peaks.push(Application.clickedPaIndex);
                        peaks.push(Application.clickedPbIndex);
                        peaks.push(Application.clickedPcIndex);
                        var fillColor; // = d3.hsl(20, 0.9, 0.55);
                        for (var r = 0; r < data2.length; r++) {
                            var row = d3.values(data2[r]);
                            if (Application.clickedPaIndex == row[0] && Application.clickedPbIndex == row[1] && Application.clickedPcIndex == row[2]) {
                                fillColor = d3.hsl(20, 0.5+0.45*row[Application.currentTime+3]/probMax, 0.5+0.45*(probMax-row[Application.currentTime+3])/probMax);
                                break;
                            }
                        }
                        this.drawLocation(xPeakPos, 0, length, peaks, maxProtein, fillColor);
                    }
                });
        },

        outerline: function(yPos, width, height, color) {
            heatMap.append("rect")
                .attr("x", 0)
                .attr("y", yPos)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("stroke", color);
        },

        drawLocation : function(xPos, yPos, length, actual_location, max_location, color) {

            var location_max = projectionOneD_peaks.append("g");
            var location = projectionOneD_peaks.append("g");

            var h = length / Application.protein_type;
            for (var j = 0; j < Application.protein_type; j++) {
                location_max.append("rect")
                    .attr("x", xPos)
                    .attr("y", yPos+h*j)
                    .attr("width", length)
                    .attr("height", h)
                    .attr("stroke", "gray")
                    .attr("fill", "none");
            }

            for (var j = 0; j < Application.protein_type; j++) {
                location.append("rect")
                    .attr("x", xPos)
                    .attr("y", yPos+h*j)
                    .attr("width", length*actual_location[j]/max_location[j])
                    .attr("height", h)
                    .attr("stroke", "gray")
                    .attr("fill", color);

                location.append("text")
                    .style("text-anchor", "left")
                    .attr("transform", "translate(" + (xPos + length*actual_location[j]/max_location[j] + 5) + "," + (yPos + h*(j+0.6)) + ")")
                    .attr("font-size", length/10 + "pt")
                    .attr("fill", "black")
                    .text(actual_location[j]);
            }

            var gene =  projectionOneD_peaks.append("g");
            var d = length / Application.gene_type;
            for (var i = 0; i < Application.gene_type; i++) {
                gene.append("rect")
                    .attr("x", xPos-d)
                    .attr("y", yPos+d*i)
                    .attr("width", d)
                    .attr("height", d)
                    .attr("stroke", "black")
                    .attr("fill", "gray");
            }
        },

        renderLineGraphs: function(headerRow_oneD) {

            for (var i = 0; i < Application.TimeStep; i++) {
                this.drawLineGraph(Application.data["Pa"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(5, 0.9, 0.55+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
                this.drawLineGraph(Application.data["Pb"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(105, 0.9, 0.55+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
                this.drawLineGraph(Application.data["Pc"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(225, 0.9, 0.55+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
            }
        },

        // draw 1D heat maps
        renderOneDHeatMaps: function(headerRow_oneD, probMax3D, xMaxP,  xMax_oneD, yMax_oneD) {

            var Pa_t20 = Application.data["Pa"];
            var Pb_t20 = Application.data["Pb"];
            var Pc_t20 = Application.data["Pc"];
            var Pabc_t20 = Application.data["Pabc"];

            var deltaY = (Application.main_height/2 - Application.shiftY*6)/3;
            this.drawHeatMaps(Pa_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1], Application.shiftY*1.5, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8,
                0, Pabc_t20, probMax3D, xMaxP, Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5);
            this.drawHeatMaps(Pb_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1], Application.shiftY*1.5 + deltaY, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8,
                1, Pabc_t20, probMax3D, xMaxP, Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5);
            this.drawHeatMaps(Pc_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1], Application.shiftY*1.5 + deltaY*2, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8,
                2, Pabc_t20, probMax3D, xMaxP, Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5);

            this.outerline(Application.shiftY*1.5, lineGraphWidth*(xMaxP[0]+1)/(xMax_oneD*1.25), deltaY * 0.8, d3.hsl(5, 0.9, 0.55));
            this.outerline(Application.shiftY*1.5 + deltaY , lineGraphWidth*(xMaxP[1]+1)/(xMax_oneD*1.25), deltaY * 0.8 , d3.hsl(105, 0.9, 0.55));
            this.outerline(Application.shiftY*1.5 + deltaY * 2 , lineGraphWidth*(xMaxP[2]+1)/(xMax_oneD*1.25), deltaY * 0.8, d3.hsl(225, 0.9, 0.55));
        }

    };

})();

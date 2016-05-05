/************************************************************************************/
// 1D projection - visualizations

// initialize the global application variable
var Application = Application || {};

// initialize the one dimension visualization object
Application.oneDV = Application.oneDV || {};

(function(){
    
    var lineGraphWidth = -1;// Application.main_width * 3 / 5;
    var lineGraphHeight = -1;//Application.main_height / 2;

    var xAxisLabelText = "Number of Molecules";
    var yAxisLabelText = "Probability (%)";
    var xScale = null;//d3.scale.linear().range([0, lineGraphWidth]);
    var yScale = null;//d3.scale.linear().range([lineGraphHeight, 0]);

    // group all the objects in the main view

    var projectionOneD = null;
    var projectionOneD_peaks = null;

    var heatMap = null;

    Application.oneDV = {

        initialize : function(main) {

            // Width and height of the line chart
            lineGraphWidth = (main.node().parentNode.clientWidth - 3 * Application.margin) * 5/6;
            lineGraphHeight = Application.main_height / 1.5;

            xScale = d3.scale.linear().range([0, lineGraphWidth]);
            yScale = d3.scale.linear().range([lineGraphHeight, 0]);

            projectionOneD = main.append("g")
                .attr("transform", "translate(" + Application.shiftX + "," + Application.shiftY + ")");

            heatMap = d3.select("#distribution1D")
                .attr("width", lineGraphWidth)
                .attr("height", lineGraphHeight / 2);

            // locations of states
            projectionOneD_peaks = d3.select('#peaks1D')
                .attr("width", lineGraphWidth )
                .attr("height", Application.main_height / 1.5);
                // .attr("transform", "translate(" + (lineGraphWidth + Application.shiftX*2) + ", 0)");
//                    + "," + Application.shiftY + ")");
        },

        // Accessor to obtain the 1D projection
        getProjection: function() { return projectionOneD },

        // Accessor to obtain the 1D peaks
        getPeaks: function(){ return projectionOneD_peaks },

        // draw x/y-axis
        drawAxis: function(xMax, yMax) {

            var chartHeight = lineGraphHeight;
            console.log(chartHeight/2);

            xScale.domain([0, xMax]);
            yScale.domain([0, yMax]);

            var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
            var yAxis = d3.svg.axis().orient("left").scale(yScale);

            var xAxisG = projectionOneD.append("g")
                .attr("transform", "translate(0," + chartHeight + ")")
                .attr("class", "x axis");

            var yAxisG = projectionOneD.append("g")
                .attr("class", "y axis");

            xAxisG
                .call(xAxis)
                .append("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(" + (lineGraphWidth/2) + "," + Application.shiftY*2 + ")")
                .attr("class", "label")
                .text(xAxisLabelText);

            yAxisG.call(yAxis)
                .append("g")
                    .attr('transform', 'translate(-55,' + chartHeight/2 + ')')
                .append("text")
                    .style("text-anchor", "middle")
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    .attr("class", "label")
                    .text(yAxisLabelText);

            var legend = projectionOneD.append("g");
            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY)
                .attr("stroke", d3.hsl(162, 0.71, 0.36));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(162, 0.71, 0.36))
                .text("Protein A");

            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY*2)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY*2)
                .attr("stroke", d3.hsl(26, 0.98, 0.43));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY*2 + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(26, 0.98, 0.43))
                .text("Protein B");

            legend.append("line")
                .attr("x1", lineGraphWidth - Application.shiftX*2.5)
                .attr("y1", Application.shiftY*3)
                .attr("x2", lineGraphWidth - Application.shiftX*1.5)
                .attr("y2", Application.shiftY*3)
                .attr("stroke", d3.hsl(244, 0.31, 0.57));

            legend.append("text")
                .style("text-anchor", "left")
                .attr("transform", "translate(" + (lineGraphWidth - Application.shiftX*1.5 +5) + "," + Application.shiftY*3 + ")")
                .attr("font-size", "12pt")
                .attr("fill", d3.hsl(244, 0.31, 0.57))
                .text("Protein C");
        },

        // draw line plots
        drawLineGraph : function(data, xColumn, yColumn, color) {

            var line = d3.svg.line()
                .x(function (d) { return xScale(d[xColumn]); })
                .y(function (d) { return yScale(d[yColumn]); });

            projectionOneD
                .append("path")
                .attr("d", line(data))
                .attr("stroke", color)
                .attr("stroke-width", "2px")
                .classed(yColumn, true);
        },

        drawHeatMaps: function(data, xMax, yMax, xColumn, yColumn, yPos, width, height, p, data2,
                               probMax, maxProtein, xPeakPos, length, label) {

            var clickedIndex = -1;
            xScale.domain([0, xMax]);

            var new_group = heatMap
                .append('g');

            new_group.append("text")
                    .style("text-anchor", "left")
                    .attr("transform", "translate(0," + (yPos + Math.ceil(height/2) + 3) + ")")
                    .attr("font-size", 10 + "pt")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .attr("id", "protein-label")
                    .text(label);

            var textOffset = new_group.select("#protein-label").node().clientWidth;
            var bars = new_group.selectAll("rect").data(data);

            bars.enter().append("rect")
                .attr("y", yPos)
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + (textOffset + 10) + ", 0)")
                .attr("class", "HeatMap");

            bars.attr("x", function (d) { return width*d[xColumn]; })
                .attr("fill", function (d) {
                    return d3.hsl(20, 0.5+0.45*d[yColumn]/yMax, 0.5+0.45*(yMax-d[yColumn])/yMax);
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

            var textOffset = heatMap.select("#protein-label").node().clientWidth;

            heatMap.append("rect")
                .attr("x", 0)
                .attr("transform", "translate(" + (textOffset + 10) + ", 0)")
                .attr("y", yPos)
                .attr("width", width)
                .attr("height", height)
                .attr("fill", "none")
                .attr("stroke", color);
        },

        drawLocation : function(xPos, yPos, length, height, actual_location, max_location, color, values) {

            var location_max =
                projectionOneD_peaks
                    .append('g')
                        .selectAll('.data')
                        .data(values).enter().append("g");

            var names = ['A','B','C'];
            var textOff = length / 5;

            location_max
                .append("rect")
                    .attr("x", xPos + textOff)
                    .attr("y", function(d, i)
                    {
                        return yPos+height*i;
                    })
                    .attr("width", length)
                    .attr("height", height)
                    .attr("stroke", "gray")
                    .attr("fill", "none");

            location_max
                .append("rect")
                .attr("x", xPos + textOff)
                .attr("y", function(d, i) { return yPos+height*i })
                .attr("width", function(d, i) { return length*actual_location[i]/max_location[i] } )
                .attr("height", height)
                .attr("stroke", "gray")
                .attr("fill", color)
                .classed('peaks', true);

            location_max
                .append("text")
                .attr('x', xPos)
                .attr('y', function(d,i)
                {
                    return yPos+height*i + height/2 + 5
                })
                .style("text-anchor", "right")
                .attr("font-size", length/10 + "pt")
                .attr("fill", "black")
                .text(function(d, i){
                    return names[i];
                });

            location_max
                .append("text")
                    .style("text-anchor", "left")
                    .attr("transform", function(d, i) {

                        var offset = length * actual_location[i]/max_location[i] + 5 + textOff;

                        if(offset >= length)
                        {
                            offset = offset - Application.margin * actual_location[i]/max_location[i];
                        }

                        return "translate(" + (xPos + offset) + "," + (yPos + height*(i+0.6)) + ")";
                    })
                    .attr("font-size", length/10 + "pt")
                    .attr("fill", "black")
                    .text(function(d, i){ return actual_location[i];});

            // var gene =  projectionOneD_peaks.append("g");
            // var d = length / Application.gene_type;
            // for (var i = 0; i < Application.gene_type; i++) {
            //     gene.append("rect")
            //         .attr("x", xPos-d)
            //         .attr("y", yPos+d*i)
            //         .attr("width", d)
            //         .attr("height", d)
            //         .attr("stroke", "black")
            //         .attr("fill", "gray");
            // }

        },

        /************************************************************************************/
        // draw peaks
        drawPeaks: function (xMaxP, probMax3D) {

            // clean up the old peaks
            projectionOneD_peaks.selectAll('g').remove();

            var peaks_Pa = Application.utils.findPeaks(Application.data["Pa"], xMaxP[0], 1);
            var peaks_Pb = Application.utils.findPeaks(Application.data["Pb"], xMaxP[1], 1);
            var peaks_Pc = Application.utils.findPeaks(Application.data["Pc"], xMaxP[2], 1);

            // number of peaks
            var peaks_num = peaks_Pa.length * peaks_Pb.length * peaks_Pc.length;

            // get the number of items to display on each row
            var num_cols = Math.ceil(Math.sqrt(peaks_num));

            // the width of the container
            var maxWidth =  projectionOneD_peaks.attr('width');
                maxHeight =   projectionOneD_peaks.attr('height');

            // width and height of the peaks
            var length = maxWidth / 7.5;
            var height = length / Application.protein_type;

            // iterative x and y starting positions
            var xPos = 0;
            var yPos = 0;

            var invalidPeaks = 0;

            for (var i = 0; i < peaks_Pa.length; i++) {
                for (var j = 0; j < peaks_Pb.length; j++) {
                    for (var k = 0; k < peaks_Pc.length; k++) {

                        var peaks = [];
                        var values = [];

                        peaks.push(peaks_Pa[i].count);
                        peaks.push(peaks_Pb[j].count);
                        peaks.push(peaks_Pc[k].count);

                        var fillColor; // = d3.hsl(20, 0.9, 0.55);

                        // invalid peaks
                        if(peaks_Pc[k].value != 0 && peaks_Pc[k].value < 1e-12 && invalidPeaks < 5)
                        {
                            // set the color of the peak to grey
                            fillColor = d3.hsl(0, 0, 0.86);

                            // add the three values to the array
                            values.push(peaks_Pa[i]);
                            values.push(peaks_Pb[j]);
                            values.push(peaks_Pc[k]);

                            // increment the number of invalid peaks
                            invalidPeaks++;
                        }
                        // we don't want to add invalid peaks after we hit 5
                        else if(peaks_Pc[k].value != 0 && peaks_Pc[k].value < 1e-12 && invalidPeaks >= 5) continue;

                        // valid peaks
                        else
                        {
                            for (var r = 0; r < Application.data["Pabc"].length; r++) {
                                var row = d3.values(Application.data["Pabc"][r]);

                                if (peaks_Pa[i].count == row[0] && peaks_Pb[j].count == row[1] && peaks_Pc[k].count == row[2]) {
                                    fillColor = d3.hsl(20, 0.5 + 0.45 * row[Application.currentTime + 3] / probMax3D,
                                        0.5 + 0.45 * (probMax3D - row[Application.currentTime + 3]) / probMax3D);

                                    values.push(peaks_Pa[i]);
                                    values.push(peaks_Pb[j]);
                                    values.push(peaks_Pc[k]);

                                    break;
                                }
                            }
                        }

                        // check to see if the newly added item would
                        // go beyond the container's width
                        if((xPos + length) >= maxWidth)
                        {
                            xPos = 0;
                            yPos += (Application.shiftY/(num_cols-1) + length);
                        }

                        Application.oneDV.drawLocation(xPos, yPos, length, height, peaks, xMaxP, fillColor, values);

                        // increment the xPos
                        xPos += (length + Application.shiftX/(num_cols-1) + 10);

                    }
                }
            }

            /* Initialize tooltip */
            var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
                var tooltip = "<span style='color:red'>Count:</span>" + d.count + "<br\><br\><span style='color:red'>Value: </span>" + d.value;
                return tooltip;
            });
            // attach the tooltip listener to the peaks element
            d3.select('#peaks1D').call(tip);

            d3.selectAll('.peaks')
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
        },

        renderLineGraphs: function(headerRow_oneD) {

            for (var i = 0; i < Application.TimeStep; i++) {
                this.drawLineGraph(Application.data["Pa"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(162, 0.71, 0.36+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
                this.drawLineGraph(Application.data["Pb"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(26, 0.98, 0.43+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
                this.drawLineGraph(Application.data["Pc"], headerRow_oneD[0], headerRow_oneD[i+1], d3.hsl(244, 0.31, 0.57+(Application.TimeStep-i-1)*0.3/Application.TimeStep));
            }
        },

        // draw 1D heat maps
        renderOneDHeatMaps: function(headerRow_oneD, probMax3D, xMaxP,  xMax_oneD, yMax_oneD) {

            var Pa_t20 = Application.data["Pa"];
            var Pb_t20 = Application.data["Pb"];
            var Pc_t20 = Application.data["Pc"];
            var Pabc_t20 = Application.data["Pabc"];

            var deltaY = (lineGraphHeight/2)/3 - Application.shiftY/2;
            this.drawHeatMaps(Pa_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1],
                Application.shiftY*1.5, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8,  0, Pabc_t20, probMax3D, xMaxP,
                Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5, "A");

            this.drawHeatMaps(Pb_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1],
                Application.shiftY*1.5 + deltaY, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8, 1, Pabc_t20, probMax3D,
                xMaxP, Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5, "B");

            this.drawHeatMaps(Pc_t20, xMax_oneD, yMax_oneD, headerRow_oneD[0], headerRow_oneD[Application.currentTime+1],
                Application.shiftY*1.5 + deltaY*2, lineGraphWidth/(xMax_oneD*1.25), deltaY * 0.8, 2, Pabc_t20, probMax3D,
                xMaxP, Application.shiftX*2, Application.main_width*2/5 - Application.shiftX*5, "C");

            this.outerline(Application.shiftY*1.5, lineGraphWidth*(xMaxP[0]+1)/(xMax_oneD*1.25), deltaY * 0.8, d3.hsl(162, 0.71, 0.36));
            this.outerline(Application.shiftY*1.5 + deltaY , lineGraphWidth*(xMaxP[1]+1)/(xMax_oneD*1.25), deltaY * 0.8 , d3.hsl(26, 0.98, 0.43));
            this.outerline(Application.shiftY*1.5 + deltaY * 2 , lineGraphWidth*(xMaxP[2]+1)/(xMax_oneD*1.25), deltaY * 0.8, d3.hsl(244, 0.31, 0.57));
        }

    };

})();

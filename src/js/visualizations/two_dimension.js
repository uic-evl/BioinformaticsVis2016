/************************************************************************************/
// 2D projection - visualizations

// initialize the global application variable
var Application = Application || {};

// initialize the one dimension visualization object
Application.twoDV = Application.twoDV || {};

(function(){

    Application.twoDV = function(){

        var xScale_twoD = 0;//d3.scale.linear().range([0, twoDHeatMapWidth]);
        var yScale_twoD = 0;//d3.scale.linear().range([twoDHeatMapHeight, 0]);

        var clickedState;

        var projectionTwoD = null;
        var headerRow_twoD = null;
        var xMax = null, yMax = null, pMax = null;

        var twoDHeatMapWidth = 0;
        var twoDHeatMapHeight = 0;
        var width = 0, height = 0;

        return {

            initialize: function (main, data) {

                twoDHeatMapWidth =  main.node().parentNode.clientWidth - 5 * Application.margin;
                twoDHeatMapHeight = Application.main_height - Application.margin * 6  - Application.shiftY;
                // twoDHeatMapHeight = Application.main_height - Application.shiftY * 3 - Application.margin * 6;

                xScale_twoD = d3.scale.linear().range([0, twoDHeatMapWidth]);
                yScale_twoD = d3.scale.linear().range([twoDHeatMapHeight, 0]);

                projectionTwoD = main.append("g")
                    .attr("transform", "translate(" + Application.shiftX + "," + ( Application.shiftY + Application.margin ) + ")");

                headerRow_twoD = Object.keys(Application.data[data][0]);  // get keys from the first row

                xMax = d3.max(Application.data[data], function (d) {
                    return +d[headerRow_twoD[1]];
                });

                yMax = d3.max(Application.data[data], function (d) {
                    return +d[headerRow_twoD[0]];
                });

                // max prob in the current selected file
                pMax = Application.utils.findMax(Application.data[data], headerRow_twoD, 2);

                width = twoDHeatMapWidth / (xMax + 1);
                height = twoDHeatMapHeight / (yMax + 1);
            },

            getProjection: function () {
                return projectionTwoD
            },

            // draw x/y-axis
            draw2DAxis: function (xMax, yMax, xLabelText, yLabelText) {

                xScale_twoD.domain([0, xMax]);
                yScale_twoD.domain([0, yMax]);

                var xAxis = d3.svg.axis().scale(xScale_twoD).orient("bottom");
                var yAxis = d3.svg.axis().scale(yScale_twoD).orient("left");

                var xAxisG = projectionTwoD.append("g")
                    .attr("transform", "translate(0," + (twoDHeatMapHeight) + ")")
                    .attr("class", "x axis");
                var yAxisG = projectionTwoD.append("g")
                    .attr("class", "y axis");

                xAxisG.call(xAxis);
                yAxisG.call(yAxis);

                var xAxisLabel = xAxisG.append("text")
                    .style("text-anchor", "left")
                    .attr("transform", "translate(" + (twoDHeatMapWidth/2) + "," + "" + 50 + ")")
                    .attr("class", "label")
                    .text(xLabelText);

                var yAxisLabel = yAxisG.append("text")
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + 0 + "," + (-15) + ")")
                    .attr("class", "label")
                    .text(yLabelText);
            },

            drawLegend: function(pMax)
            {
                // draw legend
                var legend = projectionTwoD.append("g").attr("class", "HeatMap");
                for (var i = 0; i < 50; i++) {
                    legend.append("rect")
                        .attr("x", twoDHeatMapWidth + Application.shiftX * 0.3)
                        .attr("y", Application.shiftY + 3 * i)
                        .attr("width", Application.margin * 1.5)
                        .attr("height", 3)
                        .attr("fill", d3.hsl(20, 0.5 + 0.45 * (50 - i) / 50, 0.5 + 0.45 * (1 - (50 - i) / 50)));
                }

                legend.append("text")
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + (twoDHeatMapWidth + Application.shiftX * 0.3 +
                        Application.margin * 1.5 / 2) + "," + (Application.shiftY + 3 * 50 + 15) + ")")
                    .attr("font-size", "12pt")
                    .text("0");

                legend.append("text")
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + (twoDHeatMapWidth + Application.shiftX * 0.3 +
                        Application.margin * 1.5 / 2) + "," + (Application.shiftY - 5) + ")")
                    .attr("font-size", "12pt")
                    .text(d3.round(pMax, 3));
            },
            update2DHeatMap : function (data, pMax0, t) {

                var cell = projectionTwoD.selectAll("rect").data(Application.data[data]);

                cell.enter().append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "HeatMap");

                cell.attr("x", function (d) {
                        return width * d[headerRow_twoD[1]];
                    })
                    .attr("y", function (d) {
                        return height * (yMax - d[headerRow_twoD[0]]);
                    })
                    .attr("fill", function (d) {
                        return d3.hsl(20, 0.5 + 0.45 * d[headerRow_twoD[t + 2]] / pMax, 0.5 + 0.45 * (pMax - d[headerRow_twoD[t + 2]]) / pMax);
                    })
                    .on("click", function (d) {
                        Application.show_detailTwoD = true;
                        clickedState = d;
                        console.log("pass d to state: " + clickedState);
                        self.drawCell(d, pMax, headerRow_twoD[0], headerRow_twoD[1]);
                    });

                cell.exit().remove();

                // draw legend
                this.drawLegend(pMax);
            },

            showCurves: function(data){

                // display timeline curves
                if (Application.show_projectionTwoD_time) {

                    for (var i = 0; i <= yMax; i++) {
                        for (var j = 0; j <= xMax; j++) {
                            var dataCell = [];  // prob in each cell over time
                            for (var k = 0; k < Application.TimeStep; k++) {
                                dataCell.push(d3.values(Application.data[data][i * (xMax + 1) + j])[k + 2]);
                            }

                            var x = d3.scale.linear().domain([0, Application.TimeStep - 1]).range([width * j, width * (j + 1)]);
                            var y = d3.scale.linear().domain([0, pMax]).range([twoDHeatMapHeight - height * i, twoDHeatMapHeight - height * (i + 1)]);
                            var line = d3.svg.line()
                                .x(function (d, i) {
                                    return x(i);
                                })
                                .y(function (d) {
                                    return y(d);
                                });

                            var lineGraph = projectionTwoD.append("path");//.attr("transform", "translate(" + width/TimeStep/2 + ",0)");
                            lineGraph.attr("d", line(dataCell)).attr("stroke", "black").attr("stroke-width", "1px");
                        }
                    }
                } // end - if
                // if unchecking, remove the paths
                else
                {
                    projectionTwoD.selectAll("path").remove();
                }
            },

            draw2DHeatMap: function (data, pMax0, t) {

                var self = this;

                xScale_twoD.domain([0, xMax]);
                yScale_twoD.domain([0, yMax]);

                var new_group = projectionTwoD.append("g");
                var cell = new_group.selectAll("rect").data(Application.data[data]);

                cell.enter().append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "HeatMap");

                cell.attr("x", function (d) {
                        return width * d[headerRow_twoD[1]];
                    })
                    .attr("y", function (d) {
                        return height * (yMax - d[headerRow_twoD[0]]);
                    })
                    .attr("fill", function (d) {
                        return d3.hsl(20, 0.5 + 0.45 * d[headerRow_twoD[t + 2]] / pMax, 0.5 + 0.45
                            * (pMax - d[headerRow_twoD[t + 2]]) / pMax);
                    })
                    .on("click", function (d) {
                        Application.show_detailTwoD = true;
                        clickedState = d;
                        console.log(this);
                        self.drawCell(d, pMax, headerRow_twoD[0], headerRow_twoD[1], this);
                    });

                // display the 3rd protein curves
                if (Application.show_projectionTwoD_3rdP) {
                    //draw3rdProteinCurve(data, pMax, t);
                    var headerRow_threeD = Object.keys(Application.data["Pabc"][0]);  // get keys from the first row
                    var index_3rdP;
                    for (var i = 0; i < 3; i++) {
                        if (headerRow_threeD[i] != headerRow_twoD[0] && headerRow_threeD[i] != headerRow_twoD[1]) {
                            index_3rdP = i;
                            break;
                        }
                    }
                    console.log("3rd: " + index_3rdP + " - " + headerRow_threeD[index_3rdP]);
                    var cMax = d3.max(Application.data["Pabc"], function (d) {
                        return +d[headerRow_threeD[index_3rdP]];
                    });
                    console.log("3rd max: " + cMax);
                    console.log("3rd length: " + Application.data["Pabc"].length);

                } // end - if

                //console.log("Application.show_detailTwoD: " + Application.show_detailTwoD);
                if (Application.show_detailTwoD) {
                    self.drawCell(clickedState, pMax, headerRow_twoD[0], headerRow_twoD[1]);
                }

                this.draw2DAxis(xMax, yMax, headerRow_twoD[1], headerRow_twoD[0]);

                // draw legend
                // draw legend
                this.drawLegend(pMax);
            },

            drawCell: function (state, pMax, p0, p1, svgEl) {

                console.log(svgEl);

                var x0 = svgEl.x.baseVal.value //Application.shiftX * 2;
                var y0 = svgEl.y.baseVal.value; //Application.shiftY * 4;

                console.log(y0);

                var w = (twoDHeatMapWidth - Application.shiftX * 4) / Application.TimeStep;
                var h = twoDHeatMapHeight - Application.shiftY * 3;
                var popupWidth = w * Application.TimeStep;

                if(x0 + popupWidth > twoDHeatMapWidth){
                    x0 += (twoDHeatMapWidth - (x0+popupWidth));
                }

                var detailCell = projectionTwoD.append("g").attr("class", "HeatMap");
                for (var i = 0; i < Application.TimeStep; i++) {
                    detailCell.append("rect")
                        .attr("x", x0 + w * i)
                        .attr("y", y0)
                        .attr("width", w + 1)
                        .attr("height", h)
                        .attr("fill", function (d) {
                            return d3.hsl(20, 0.5 + 0.45 * d3.values(state)[i + 2] / pMax, 0.5
                                + 0.45 * (pMax - d3.values(state)[i + 2]) / pMax);
                        });
                }

                detailCell.append("text")
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + (twoDHeatMapWidth - Application.shiftX * 4)
                        + "," + (y0 + Application.shiftY) + ")")
                    .attr("font-size", "12pt")
                    .text(p0 + ": " + d3.values(state)[0]);

                detailCell.append("text")
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + (twoDHeatMapWidth - Application.shiftX * 4)
                        + "," + (y0 + Application.shiftY * 2) + ")")
                    .attr("font-size", "12pt")
                    .text(p1 + ": " + d3.values(state)[1]);

                // time line curve
                var data = [];
                for (var i = 0; i < Application.TimeStep; i++) {
                    data.push(d3.values(state)[i + 2]);
                }
                //console.log(data);
                var x = d3.scale.linear().domain([0, Application.TimeStep]).range([x0, w * Application.TimeStep + x0]);
                var y = d3.scale.linear().domain([0, pMax]).range([h + y0, y0]);
                var line = d3.svg.line()
                    .x(function (d, i) {
                        return x(i);
                    })
                    .y(function (d) {
                        return y(d);
                    });

                var lineGraph = projectionTwoD.append("path").attr("transform", "translate(" + w / 2 + ",0)");
                lineGraph.attr("d", line(data)).attr("stroke", "black");

                var boundray = projectionTwoD.append("rect")
                    .attr("x", x0)
                    .attr("y", y0)
                    .attr("width", w * Application.TimeStep)
                    .attr("height", h)
                    .attr("fill", "none")
                    .attr("stroke", "black");

                var closeButton = projectionTwoD.append("circle")
                    .attr("cx", w * Application.TimeStep + x0)
                    .attr("cy", y0)
                    .attr("r", 10)
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .on("click", function () {
                        Application.show_detailTwoD = false;
                        detailCell.remove();
                        lineGraph.remove();
                        boundray.remove();
                        closeButton.remove();
                    });
            }

        }
    };

})();
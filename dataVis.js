var exponent = 1;
function init(exponent) {
    d3.select("#chartContainer").select("svg").remove();
    var formatDate, dataset, header, xScale, yScale, xAxis, yAxis, svg, coalConsLine,
        gasConsLine, hydroConsLine, oilConsLine, solarConsLine, windConsLine, toolTip, lineData;

    //dimensions
    const margin = { top: 30, right: 40, bottom: 70, left: 20 };
    const width = 650 - margin.right - margin.left;
    const height = 520 - margin.top - margin.bottom;

    //format date
    formatDate = d3.timeFormat("%Y");

    //import data from csv file
    d3.csv("Australian_Energy_Production_and_Consumption.csv", function (d) {
        return {
            //to create new Date object for each year
            date: new Date(d.year),

            //coal consumption
            coalCons: parseFloat(d.coal_consumption),

            //oil consumption
            oilCons: parseFloat(d.oil_consumption),

            //gas consumption
            gasCons: parseFloat(d.gas_consumption),

            //solar energy consumption
            solarCons: parseFloat(d.solar_consumption),

            //wind energy consumption
            windCons: parseFloat(d.wind_consumption),

            //hydro consumption
            hydroCons: parseFloat(d.hydro_consumption)
        }
    }).then(function (data) {

        dataset = data;
        MultiLineChart(dataset);

        //to check if the dataset has been imported
        //console.table(dataset, ["date", "coalCons", "coalProd", "elecProd", "gasCons", "gasProd", "hydroCons", "oilCons", "oilProd", "solarCons", "windCons"]);
    });

    function MultiLineChart() {
        //chart base
        svg = d3.select("#chartContainer")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //append header group
        header = svg.append('g')
            .attr("class", "chartHeader")
            .attr("class", "mainHeader")
            .attr("transform", "translate(23," + -margin.top * 0.5 + ")")
            .append("text");

        //append text to header group
        header.append("tspan")
            .text("Australian Energy Consumption by Energy Source");

        header.append("tspan")
            .attr("class", "subHeading")
            .attr("x", 0)
            .attr("y", 15)
            .text("Measured in Terawatt hour (TWh) from 2000-2019")
            .style('fill', 'grey');


        //x scale setup
        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function (d) { return d.date; }),
                d3.max(dataset, function (d) { return d.date; })])
            .nice() //makes scale end in round number, in this case will end in 2020 instead of 2019
            .range([0, width]);

        //defining x axis
        xAxis = d3.axisBottom()
            .ticks(d3.timeYear.every(1))
            .scale(xScale);

        //y scale setup
        // yScale = d3.scaleLinear()
        //     .domain([0, d3.max(dataset, function (d) {
        //         //finds the max value from all columns/attributes
        //         return Math.max(d.coalCons, d.gasCons, d.hydroCons, d.oilCons, d.solarCons, d.windCons)
        //     })])
        //     .nice() //makes scale end in round number
        //     .range([height, 0]);

        yScale = d3.scalePow()
            .domain([0, d3.max(dataset, function (d) {
                //finds the max value from all columns/attributes
                return Math.max(d.coalCons, d.gasCons, d.hydroCons, d.oilCons, d.solarCons, d.windCons)
            })])
            .nice() //makes scale end in round number
            .range([height, 0])
            .exponent(exponent);

        //defining y axis
        yAxis = d3.axisLeft()
            .ticks(10)
            .scale(yScale);

        //an array to hold all of the property names
        var propertyNames = [];
        for (var name in dataset[0]) {
            if (name == "date") {
                continue;
            }

            propertyNames.push(name);
        }

        //colors 
        //var colors = d3.schemeCategory10;
        var colors = ["#000000", "#e69f00", "#56b4e9", "#ff0000", "#f0e442", "#4b0092"];

        //draw each line with different color
        drawAllLines();

        //call on x axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + "," + height + ")") //place x axes on the bottom
            .call(xAxis);

        //call on y axis
        svg.append("g")
            .attr("class", "axis yAxis")
            .attr("transform", "translate(" + margin.left + ", 0)") //place y axis on the left side
            .call(yAxis);

        //draws all the lines
        function drawLines(pName, color) {
            //energy consumption line genetator        
            consLine = d3.line()
                .x(function (d) { return xScale(d.date); })
                .y(function (d) { return yScale(d[pName]); });

            //Creating the energy consumption line
            svg.append("path")
                .datum(dataset)
                .attr("class", "consLines " + pName + "Line")
                .attr("transform", "translate(" + margin.left + ", 0)")
                .attr("d", consLine)
                .style("stroke", color)
        }

        function drawAllLines() {
            for (var i = 0; i < propertyNames.length; i++) {
                drawLines(propertyNames[i], colors[i]);
            }
        }

        //group for the hover - vertical line and tooltip
        var hoverLineGroup = svg.append("g")
            .attr("class", "hover-line")
            .attr("transform", "translate(" + margin.left + ", 0)");

        //vertical line
        var hoverLine = hoverLineGroup
            .append("line")
            .attr("stroke", "#000")
            .attr("y1", 0)
            .attr("y2", height);

        //define tooltip
        toolTip = d3.selectAll(".toolTip");

        //invisible when no mouse events
        hoverLineGroup.style("opacity", 1e-6);

        //rectangular area of hover
        var rectHover = svg.append("rect")
            .data(dataset)
            .attr("fill", "none")
            .attr("class", "overlay")
            .attr("width", width + margin.left)
            .attr("height", height + margin.top);

        //functions for hover events
        svg.on("mouseout", mouseout)
            .on("mousemove", hoverMouseOn);

        //gets only date
        var bisectDate = d3.bisector(function (d) { return d.date; }).left;

        function hoverMouseOn() {
            //get x and y mouse positions
            var mouse_x = d3.mouse(this)[0];
            var mouse_y = d3.mouse(this)[1];

            //actual x value
            var mouseDate = xScale.invert(mouse_x);

            //returns the index to the current data item
            var i = bisectDate(dataset, mouseDate);
            var d0 = dataset[i - 1]
            var d1 = dataset[i];

            // work out which date value is closest to the mouse
            var d = mouseDate - d0[0] > d1[0] - mouseDate ? d1 : d0;

            //draw tool tip div
            toolTipValues();

            //to align it with the transformed svg
            hoverLine.attr("transform", "translate(" + xScale(d.date) + ",0)");
            hoverLineGroup.style("opacity", 1);

            function toolTipValues() {
                //define the tooltip coordinates
                toolTip
                    .attr("transform", "translate(" + xScale(d.date) + ",0)")
                    .style('left', d3.event.clientX + 10 + 'px')
                    .style('top', height - 200 + 'px')
                    .style('opacity', 0.97);

                toolTip.select('.year').html('Energy consumption in ' + formatDate(mouseDate));

                //add all current data values to the tooltip
                for (var i = 0; i < propertyNames.length; i++) {
                    var pName = propertyNames[i];
                    var property;

                    switch (propertyNames[i]) {
                        case "oilCons":
                            property = "Oil";
                            break;
                        case "coalCons":
                            property = "Coal";
                            break;
                        case "gasCons":
                            property = "Gas";
                            break;
                        case "hydroCons":
                            property = "Hydro";
                            break;
                        case "solarCons":
                            property = "Solar";
                            break;
                        case "windCons":
                            property = "Wind";
                            break;
                    }

                    toolTip.select('.' + propertyNames[i])
                        .html(property + ': ' + Math.round(d[pName] * 100) / 100)
                        .style('color', colors[i]);
                }

            }

        }

        function mouseout() {
            hoverLineGroup.style("opacity", 1e-6);
            toolTip.style('opacity', 0);
        }

        drawLegend();

        function drawLegend() {
            var size = 13
            // Add one rect in the legend for each name
            svg.selectAll("labelRects")
                .data(colors)
                .enter()
                .append("rect")
                .attr("x", 582)
                .attr("y", function (d, i) { return 5 + i * (size + 5) }) // 5 is where the first rectangle appears
                .attr("width", size)
                .attr("height", size)
                .style("fill", function (d) { return d })
                .data(propertyNames)
                .attr("class", function (d) {
                    return "legendRects " + d + "Rect";
                })
                .on("click", legendOnclick)


            // Add text for each rectangle in the legend
            svg.selectAll("mylabels")
                .data(propertyNames)
                .enter()
                .append("text")
                .attr("x", 582 + size * 1.2)
                .attr("y", function (d, i) { return 5 + i * (size + 5) + (size / 2) })
                .style("fill", function (d) { return colors[0] })
                .text(function (d) {
                    switch (d) {
                        case "oilCons":
                            property = "Oil";
                            break;
                        case "coalCons":
                            property = "Coal";
                            break;
                        case "gasCons":
                            property = "Gas";
                            break;
                        case "hydroCons":
                            property = "Hydro";
                            break;
                        case "solarCons":
                            property = "Solar";
                            break;
                        case "windCons":
                            property = "Wind";
                            break;
                    }
                    return property;
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size", "12.7px")
                .data(propertyNames)
                .attr("class", function (d) { return "legendText " + d + "Text"; })
                .on("click", legendOnclick)
                .on("blur", drawAllLines)


            // a function that will be called when either the rectangle or text of a legend is clicked
            function legendOnclick() {

                var lineOpacity = 0.05;
                var nodeClicked = this;
                drawAllLines();

                if (nodeClicked.classList.contains('coalConsText') || nodeClicked.classList.contains('coalConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.coalConsLine)")
                        .style("opacity", lineOpacity);
                }
                else if (nodeClicked.classList.contains('gasConsText') || nodeClicked.classList.contains('gasConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.gasConsLine)")
                        .style("opacity", lineOpacity);
                }
                else if (nodeClicked.classList.contains('oilConsText') || nodeClicked.classList.contains('oilConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.oilConsLine)")
                        .style("opacity", lineOpacity);
                }
                else if (nodeClicked.classList.contains('hydroConsText') || nodeClicked.classList.contains('hydroConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.hydroConsLine)")
                        .style("opacity", lineOpacity);
                }
                else if (nodeClicked.classList.contains('windConsText') || nodeClicked.classList.contains('windConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.windConsLine)")
                        .style("opacity", lineOpacity);
                }
                else if (nodeClicked.classList.contains('solarConsText') || nodeClicked.classList.contains('solarConsRect')) {
                    //reduce the opacity of the other lines
                    svg.selectAll(".consLines:not(.solarConsLine)")
                        .style("opacity", lineOpacity);
                }
                else {
                    drawAllLines();
                }

            }


        }


    }

}

//a global function to track the slider value chages
function sliderChange(ex) {
    console.log(ex)
    exponent = ex;
    init();
    return exponent;
}

window.onload = init(exponent);


function init() {
    var formatDate, dataset, header, xScale, yScale, xAxis, yAxis, svg, coalConsLine;

    //dimensions
    const margin = { top: 30, right: 40, bottom: 70, left: 20 };
    const width = 650 - margin.right - margin.left;
    const height = 530 - margin.top - margin.bottom;

    //format date
    formatDate = d3.timeFormat("%Y");

    //import data from csv file
    d3.csv("Australian_Energy_Production_and_Consumption.csv", function (d) {
        return {
            //to create new Date object for each year
            date: new Date(d.year),

            //coal consumption
            coalCons: parseFloat(d.coal_consumption),

            //coal production
            coalProd: parseFloat(d.coal_production),

            //electricity generation
            elecPrdo: parseFloat(d.electricity_generation),

            //gas consumption
            gasCons: parseFloat(d.gas_consumption),

            //gas production
            gasProd: parseFloat(d.gas_production),

            //hydro consumption
            hydroCons: parseFloat(d.hydro_consumption),

            //oil consumption
            oilCons: parseFloat(d.oil_consumption),

            //oil production
            oilProd: parseFloat(d.oil_production),

            //solar energy consumption
            solarCons: parseFloat(d.solar_consumption),

            //wind energy consumption
            windCons: parseFloat(d.wind_consumption)
        }
    }).then(function (data) {

        dataset = data;
        MultiLineChart(dataset);

        //to check if the dataset has been imported
        //console.table(dataset, ["date", "coalCons", "coalProd", "elecProd", "gasCons", "gasProd", "hydroCons", "oilCons", "oilProd", "solarCons", "windCons"]);
    });

    function MultiLineChart() {
        //chart base
        svg = d3.select("body")
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
        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function (d) {
                //finds the max value from all columns/attributes
                return Math.max(d.coalCons, d.gasCons, d.hydroCons, d.oilCons, d.solarCons, d.windCons)
            })])
            .nice() //makes scale end in round number
            .range([height, 0]);

        //defining y axis
        yAxis = d3.axisLeft()
            .ticks(10)
            .scale(yScale);

        //call on x axis
        svg.append("g")
            .attr("class", "axis")
            .attr("class", "Xaxis")
            .attr("transform", "translate(" + margin.left + "," + height + ")") //place x axes on the bottom
            .call(xAxis);

        //call on y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ", 0)") //place y axis on the left side
            .call(yAxis);

        //coal energy consumption line genetator        
        coalConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.coalCons); });

        //Creating the coal energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "coalConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", coalConsLine)
            .style("stroke", "#010E13");

        //gas energy consumption line genetator        
        gasConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.gasCons); });

        //Creating the gas energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "gasConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", gasConsLine)
            .style("stroke", "#ffa600");

        //hydro energy consumption line genetator        
        hydroConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.hydroCons); });

        //Creating the hydro energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "hydroConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", hydroConsLine)
            .style("stroke", "#EF3E36");

        //Oil energy consumption line genetator        
        oilConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.oilCons); });

        //Creating the oil energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "oilConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", oilConsLine)
            .style("stroke", "#FFF275");

        //Solar energy consumption line genetator        
        solarConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.solarCons); });

        //Creating the oil energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "solarConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", solarConsLine)
            .style("stroke", "#0B6E4F");

        //Wind energy consumption line genetator        
        windConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.windCons); });

        //Creating the wind energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "windConsLine")
            .attr("class", "consLines")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .attr("d", windConsLine)
            .style("stroke", "#17BEBB");

    }

}

window.onload = init;
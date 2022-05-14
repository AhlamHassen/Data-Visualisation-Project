function init() {
    var formatDate, dataset, header, xScale, yScale, xAxis, yAxis, svg, coalConsLine;

    //dimensions
    const margin = { top: 30, right: 40, bottom: 70, left: 40 };
    const width = 750 - margin.right - margin.left;
    const height = 540 - margin.top - margin.bottom;

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

            //hydro production
            hydroProd: parseFloat(d.hydro_consumption),

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
        //console.table(dataset, ["date", "coalCons", "coalProd", "elecProd", "gasCons", "gasProd", "hydroProd", "oilCons", "oilProd", "solarCons", "windCons"]);
    });

    function MultiLineChart() {
        //chart base
        svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);

        // //append header group
        // header = svg.append('g')
        // .attr("class", "chartHeader")
        // .append("text");

        // header.append("tspan").text("Australian Energy Production and Consumption");


        //x and y scale setup
        xScale = d3.scaleTime()
            .domain([
                d3.min(dataset, function (d) { return d.date; }),
                d3.max(dataset, function (d) { return d.date; })])
            .range([0, width]);

        yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function (d) {
                return Math.max(d.coalCons, d.coalProd, d.elecPrdo, d.gasCons, d.gasProd, d.hydroProd, d.oilCons, d.oilProd, d.solarCons, d.windCons)
            })])
            .nice() // makes scale end in round number
            .range([height, 0]);

        //defining x and y axis
        xAxis = d3.axisBottom()
            .ticks(d3.timeYear.every(1))
            .scale(xScale);

        yAxis = d3.axisLeft()
            .ticks(10)
            .scale(yScale);

        //call on x & y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + "," + height + ")") //place x axes on the bottom
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ", 0)") //place y axis on the side
            .call(yAxis);

        //coal energy consumption line genetator        
        coalConsLine = d3.line()
            .x(function (d) { return xScale(d.date); })
            .y(function (d) { return yScale(d.coalCons); });

        //Creating the coal energy consumption line
        svg.append("path")
            .datum(dataset)
            .attr("class", "coalConsLine")
            .attr("d", coalConsLine);
    }

}

window.onload = init;
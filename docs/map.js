// map.js

let default_year = 2006;
let selectedDataType = "participation";

(async function() {
    const mapWidth = 1000;
    const mapHeight = 600;
    //const marginLeft = 100;

    const map = d3.select("#map")
        .append("svg")
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    const projection = d3.geoAlbersUsa()
        .scale(900)
        //.translate([mapWidth / 2 - marginLeft, mapHeight / 2]);

    const path = d3.geoPath().projection(projection);

    // Choropleth colors
    const participationColor = d3.scaleSequential()
        .domain([0.04, 0.28])
        .interpolator(t => d3.interpolateOranges(0.1 + 0.9 * t)); 
    const benefitsColor = d3.scaleSequential()
        .domain([0, 1500])
        .interpolator(t => d3.interpolateGreens(0.2 + 0.8 * t)); 
    const noDataColor = "#cccccc";

    const map_grp = map.append("g");

    // Load geojson
    const geojson = await d3.json("clean_data/state.geojson");
    const grouped = d3.group(geojson.features, d => d.properties.STATEFP);
    const state_geoms = new Map();
    geojson.features.forEach(f => {
        if (!state_geoms.has(f.properties.STATEFP)) state_geoms.set(f.properties.STATEFP, f.geometry);
    });

    function getYearData(year) {
        const output = [];
        grouped.forEach((records, statefp) => {
            const match = records.find(r => r.properties.Year == year);
            if (match) {
                output.push({
                    statefp,
                    geometry: state_geoms.get(statefp),
                    props: match.properties
                });
            }
        });
        return output;
    }

    // Legend
    const legend_w = 300;
    const legend_h = 15;
    const legend_y = 30;

    const legend = map_grp.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(400, ${legend_y})`);

    const legendTitle = map_grp.append("text")
        .attr("x", 400 + legend_w / 2)
        .attr("y", legend_y - 10)
        .attr("text-anchor", "middle")
        .attr("class", "axis-title")
        .attr("font-weight", "bold")
        .text("SNAP Participation");

    const defs = map_grp.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "legend-gradient");

    gradient.selectAll("stop")
        .data(d3.range(0.04, 0.281, 0.01))
        .enter()
        .append("stop")
        .attr("offset", d => d / 0.28)
        .attr("stop-color", d => participationColor(d));

    legend.append("rect")
        .attr("width", legend_w)
        .attr("height", legend_h)
        .style("fill", "url(#legend-gradient)");

    const legendScale = d3.scaleLinear().domain([0.04, 0.28]).range([0, legend_w]);
    const legendAxis = d3.axisBottom(legendScale)
        .tickValues([0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28])
        .tickFormat(d => `${(d * 100).toFixed(0)}%`);

    const legendAxisGroup = legend.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(0, ${legend_h})`)
        .call(legendAxis);

    // States group
    const statePaths = map_grp.selectAll("path.state")
        .data(getYearData(default_year), d => d.statefp)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", d => path({ type: "Feature", geometry: d.geometry }))
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

    // Function to update map colors & legend
    window.updateMap = function(year, dataType) {
        selectedDataType = dataType;

        //mapTitle.text(`${dataType === "participation" ? "SNAP Participation" : "SNAP Benefits Distributed"} by State in ${year}`);

        const yearData = getYearData(year);
        const colorScale = dataType === "participation" ? participationColor : benefitsColor;

        // Update legend
        if (dataType === "participation") {
            legendTitle.text(`State SNAP Participation in ${year}`);
            gradient.selectAll("stop")
                .data(d3.range(0.04, 0.281, 0.01))
                .join("stop")
                .attr("offset", d => d / 0.28)
                .attr("stop-color", d => colorScale(d));

            legendAxisGroup.transition().duration(500)
                .call(d3.axisBottom(d3.scaleLinear().domain([0.04, 0.28]).range([0, legend_w]))
                    .tickValues([0.04, 0.08, 0.12, 0.16, 0.2, 0.24, 0.28])
                    .tickFormat(d => `${(d * 100).toFixed(0)}%`));
        } else {
            legendTitle.text(`State SNAP Benefits in ${year}`);
            gradient.selectAll("stop")
                .data(d3.range(3, 1501, 10))
                .join("stop")
                .attr("offset", d => d / 1500)
                .attr("stop-color", d => colorScale(d));

            legendAxisGroup.transition().duration(500)
                .call(d3.axisBottom(d3.scaleLinear().domain([3, 1500]).range([0, legend_w]))
                    .tickValues([3, 500, 1000, 1500])
                    .tickFormat(d => `$${d}M`));
        }

        // Update states
        statePaths.data(yearData, d => d.statefp)
            .transition().duration(500)
            .attr("fill", d => {
                if (dataType === "participation") return colorScale(d.props["Pct Participation"]);
                const val = d.props["Total SNAP Issuance"];
                return val > 0 ? colorScale(val / 1000000) : noDataColor;
            });

        // Tooltip
        statePaths.on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "black").attr("stroke-width", 0.5);
            d3.select("#tooltip")
                .style("display", "block")
                .html(`<strong>${d.props.Location}</strong><br>
                       Population: ${(d.props.Population/1000000).toFixed(2)}M<br>
                       Participation: ${(d.props["Pct Participation"]*100).toFixed(2)}%<br>
                       Benefits: ${d.props["Total SNAP Issuance"] > 0 ? "$"+(d.props["Total SNAP Issuance"]/1000000).toFixed(2)+"M" : "No data"}<br>
                       Gini: ${d.props.Gini}<br>
                       Unemployment: ${(d.props["Unemployment Rate"]*100).toFixed(2)}%
                    `)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 5 + "px");
        }).on("mouseout", function() {
            d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.5);
            d3.select("#tooltip").style("display", "none");
        });
    };

    // Default view
    window.updateMap(default_year, selectedDataType);
})();

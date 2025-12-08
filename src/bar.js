// bar.js

(async function() {
    const margin = { top: 60, right: 100, bottom: 60, left: 100 };
    const bar_h = 200;
    const bar_w = window.innerWidth - margin.left - margin.right;
    const bar_inner_h = bar_h - margin.top - margin.bottom;
    let default_year = 2006;
    let selectedDataType = "participation";

    const bar = d3.select("#bar")
        .append("svg")
        .attr("width", window.innerWidth)
        .attr("height", bar_h)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bar title
    const barTitle = bar.append("text")
        .attr("x", bar_w / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("class", "bar-title")
        .text("Percent of Residents Participating in SNAP");

    // y-axis label
    const yLabel = bar.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -bar_inner_h / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("class", "y-axis")
        .text("SNAP Participation");

    // Load national data
    const national_data = await d3.csv("../data/clean_data/national.csv", d3.autoType);

    const x = d3.scaleBand()
        .domain(national_data.map(d => d.Year))
        .range([0, bar_w])
        .padding(0.2);

    let y = d3.scaleLinear()
        .domain([0, d3.max(national_data, d => d["Pct Participation"])])
        .range([bar_inner_h, 0]);

    // X-axis
    bar.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${bar_inner_h})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Y-axis
    const yAxis = bar.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y)
            .tickValues(d3.range(0,0.1501,0.05))
            .tickFormat(d => (d * 100).toFixed(0) + "%"));

    // Bars
    const bars = bar.selectAll("rect")
        .data(national_data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Year))
        .attr("y", d => y(d["Pct Participation"]))
        .attr("width", x.bandwidth())
        .attr("height", d => bar_inner_h - y(d["Pct Participation"]))
        .attr("fill", d => d.Year === default_year ? "#CC5500" : "lightblue")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#CC5500");
            d3.select("#tooltip")
                .style("display", "block")
                .html(`<strong>${d.Year}</strong><br>
                       Population: ${(d.Population/1000000).toFixed(2)}M<br>
                       Participation: ${(d["Pct Participation"]*100).toFixed(2)}%<br>
                       Benefits: $${(d["Total Benefits (MUSD)"]/1000).toFixed(2)}B<br>
                       Gini: ${d.Gini}<br>
                       Unemployment: ${(d.Unemployment*100).toFixed(2)}%
                    `)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill", d.Year === default_year ? (selectedDataType === "participation" ? "#CC5500" : "green") : "lightblue");
            d3.select("#tooltip").style("display", "none");
        })
        .on("click", function(event, d) {
            default_year = d.Year;
            bars.attr("fill", d => d.Year === default_year ? (selectedDataType === "participation" ? "#CC5500" : "green") : "lightblue");
            updateMap(default_year, selectedDataType);
            updateEvent(default_year);
        });

    // Dropdown listener
    const dropdown = document.getElementById("data-dropdown");
    dropdown.addEventListener("change", function() {
        selectedDataType = this.value;
        updateBarChart(selectedDataType);
        updateMap(default_year, selectedDataType);
        updateEvent(default_year);
    });

    // Update bar chart function
    function updateBarChart(dataType) {
        let yLabelText, yDomain, tickFormat, tickValues;

        if (dataType === "participation") {
            barTitle.text("Percent of U.S. Residents Participating in SNAP");
            yLabelText = "SNAP Participation";
            yDomain = [0, d3.max(national_data, d => d["Pct Participation"])];
            tickFormat = d => (d*100).toFixed(0) + "%";
            tickValues = d3.range(0, yDomain[1] + 0.0001, 0.05);
        } else {
            barTitle.text("SNAP Benefits Distributed in the U.S.");
            yLabelText = "SNAP Benefits";
            yDomain = [0, d3.max(national_data, d => d["Total Benefits (MUSD)"])*1.2];
            tickFormat = d => "$" + (d/1000).toFixed(0) + "B";
            tickValues = [0, 50000, 100000, 150000];
        }

        yLabel.text(yLabelText);

        y = d3.scaleLinear().domain(yDomain).range([bar_inner_h, 0]);
        yAxis.transition().duration(500).call(d3.axisLeft(y).tickFormat(tickFormat).tickValues(tickValues));

        bars.transition().duration(500)
            .attr("y", d => y(dataType === "participation" ? d["Pct Participation"] : d["Total Benefits (MUSD)"]))
            .attr("height", d => bar_inner_h - y(dataType === "participation" ? d["Pct Participation"] : d["Total Benefits (MUSD)"]))
            .attr("fill", d => d.Year === default_year ? (dataType === "participation" ? "#CC5500" : "green") : "lightblue");

        // Update tooltip for new dataType
        bars.on("mouseover", function(event, d) {
            d3.select(this).attr("fill", d.Year === default_year ? (dataType === "participation" ? "#CC5500" : "green") : "darkgray");
            d3.select("#tooltip")
                .style("display", "block")
                .html(`<strong>${d.Year}</strong><br>
                    Population: ${(d.Population/1000000).toFixed(2)}M<br>
                    Participation: ${(d["Pct Participation"]*100).toFixed(2)}%<br>
                    Benefits: $${(d["Total Benefits (MUSD)"]/1000).toFixed(2)}B<br>
                    Gini: ${d.Gini}<br>
                    Unemployment: ${(d.Unemployment*100).toFixed(2)}%
                 `)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY - 28 + "px");
        });
    }
})();

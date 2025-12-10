// events.js

const event_w = 400;
const event_h = 600;

const events = d3.select("#events")
    .append("svg")
    .attr("width", event_w)
    .attr("height", event_h);

// Title
events.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .attr("class", "events-title")
    .text("SNAP Policies & Economic Events");

// Load event data
(async function () {
    const raw = await d3.csv("../data/clean_data/events.csv", d3.autoType);

    // Group duplicate years
    const grouped = d3.group(raw, d => d.Headline);
    let processed = [];

    grouped.forEach((records, headline) => {
        const years = records.map(d => d.Year).sort();
        processed.push({
            headline,
            type: records[0].Type,
            summary: records[0].Summary,
            years,
            startYear: years[0],
            endYear: years[years.length - 1],
            yearText: years.length === 1 ? `${years[0]}` : `${years[0]}–${years[years.length - 1]}`
        });
    });

    processed.sort((a, b) => a.startYear - b.startYear);

// Event cards
    const cardX = 20;
    const cardWidth = event_w - 40;
    const cardHeight = 40;
    let currentY = 60;

    const container = events.append("g").attr("class", "event-cards");

    // Keep references for scrolling
    const detailCards = {};

// Event details
    const eventDetail = d3.select("#event-detail");

    processed.forEach(ev => {
        const g = container.append("g")
            .attr("class", "event-card")
            .attr("transform", `translate(${cardX}, ${currentY})`);

        const headerRect = g.append("rect")
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .attr("rx", 6)
            .attr("fill", "#ccc");

        g.append("text")
            .attr("x", 10)
            .attr("y", cardHeight / 2 + 5)
            .attr("font-size", "13px")
            .attr("font-weight", "bold")
            .text(`${ev.yearText} — ${ev.headline}`);

        currentY += cardHeight + 10;

        const detail = eventDetail.append("div")
            .attr("class", "event-detail-card")
            .style("margin", "20px 0")
            .style("padding", "15px")
            .style("border-radius", "6px")
            .style("border", "1px solid #ccc")
            .style("background", "#f9f9f9");

        detail.append("div")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text(`${ev.yearText} — ${ev.headline}`);

        detail.append("div")
            .style("margin-top", "8px")
            .style("font-size", "14px")
            .text(ev.summary);

        // scroll lookup
        detailCards[ev.headline] = detail.node();

        // click and scroll to detail events
        g.on("click", () => {
            detail.node().scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

// Highlight event when matching year is selected from bar
    window.updateEvent = function (year) {
        container.selectAll(".event-card").each(function (_, i) {
            const ev = processed[i];
            const header = d3.select(this).select("rect");
            const active = year >= ev.startYear && year <= ev.endYear;

            header.attr("fill", active ? "lightblue" : "#ccc");
        });
    };
})();
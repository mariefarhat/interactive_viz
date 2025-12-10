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

// Load events
(async function () {
    const raw = await d3.csv("clean_data/events.csv", d3.autoType);

    // Group duplicate years
    // Ex: The Great Recession has records for 2007-2009, but we only need one to show
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
            yearText: years.length === 1
                ? `${years[0]}`
                : `${years[0]}–${years[years.length - 1]}`
        });
    });

    processed.sort((a, b) => a.startYear - b.startYear);

    const cardX = 20;
    const cardWidth = event_w - 40;
    const cardHeight = 40;
    let currentY = 60;

    const container = events.append("g").attr("class", "event-cards");

    // Event details section
    const eventDetail = d3.select("#event-detail");

    const detailCards = {};

    processed.forEach(ev => {
        const g = container.append("g")
            .attr("class", "event-card")
            .attr("transform", `translate(${cardX}, ${currentY})`);

        // card background
        g.append("rect")
            .attr("class", "event-card-bg")
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .attr("rx", 6);

        // label
        g.append("text")
            .attr("x", 10)
            .attr("y", cardHeight / 2 + 5)
            .attr("class", "event-card-text")
            .text(`${ev.yearText} — ${ev.headline}`);

        currentY += cardHeight + 10;

        // detail card
        const detail = eventDetail
            .append("div")
            .attr("class", "event-detail-card");

        detail.append("div")
            .attr("class", "event-detail-title")
            .text(`${ev.yearText} — ${ev.headline}`);

        detail.append("div")
            .attr("class", "event-detail-summary")
            .text(ev.summary);

        detailCards[ev.headline] = detail.node();

        // click and auto scroll
        g.on("click", () => {
            detail.node().scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // highlight event when year matches
    window.updateEvent = function (year) {
        container.selectAll(".event-card").each(function (_, i) {
            const ev = processed[i];
            const active = year >= ev.startYear && year <= ev.endYear;

            d3.select(this)
                .classed("active", active);
        });
    };
})();

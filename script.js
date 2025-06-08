let scene = 0;
let data;

function init() {
    d3.csv("data/co2_mm_mlo.csv").then(raw => {
        data = raw.map(d => ({
            date: new Date(+d.year, +d.month - 1),
            value: +d.interpolated
        })).filter(d => !isNaN(d.value));

        renderScene();
        updateNav();

        d3.select("#next").on("click", () => {
            if (scene < 3) scene++;
            renderScene();
            updateNav();
        });

        d3.select("#back").on("click", () => {
            if (scene > 0) scene--;
            renderScene();
            updateNav();
        });

        d3.selectAll(".scene-btn").on("click", function () {
            scene = +d3.select(this).attr("data-scene");
            renderScene();
            updateNav();
        });
    });

    document.getElementById("close-instruction").addEventListener("click", () => {
    document.getElementById("tooltip-instruction").style.display = "none";
});

}

// navigation buttons below the chart
function updateNav() {
    // highlight current scene button
    d3.selectAll(".scene-btn").classed("active", false);
    d3.select(`.scene-btn[data-scene='${scene}']`).classed("active", true);
}

// change to different scenes
function renderScene() {
    d3.select("#chart").selectAll("*").remove(); // clear SVG

    const svg = d3.select("#chart");
    const width = +svg.attr("width") - 100;
    const height = +svg.attr("height") - 80;
    const g = svg.append("g").attr("transform", "translate(60,30)");

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    let sceneData;
    let text;
    let pinned = false;

    if (scene === 0) {
        // scene 1: early years
        text = "In 1958, atmospheric CO₂ was 315 ppm. Monitoring at Mauna Loa begins.";
        sceneData = data.filter(d => d.date.getFullYear() <= 1970);

        console.log("Scene data length:", sceneData.length);
        console.log(sceneData.slice(0, 5));  // preview first few data points
    }
    
    else if (scene === 1) {
        // scene 2: steeping slope after 1980s
        text = "Past the 1970s, CO₂ has been rising steadily, and faster in recent decades.";
        sceneData = data.filter( d => {
            const year = d.date.getFullYear();
            return year >= 1970 && year <= 2010
        });
    }
    
    else if (scene === 2) {
        // scene 3: recent years (up till this year, 2025)
        text = "CO₂ passed 400 ppm around 2015. Seasonal oscillations show the breathing of the planet.";
        sceneData = data.filter(d => {
            const year = d.date.getFullYear();
            return year >= 2010 && year <= 2025;
        });
    }

    else if (scene === 3) {
        // scene 4: the full trend
        text = "From 1970 to today, CO₂ levels have risen by more than 100 ppm. The trend is clear and urgent.";
        sceneData = data.filter(d => {
            const year = d.date.getFullYear();
            return year >= 1970 && year <= 2025;
        });
    }

    // set domains
    x.domain(d3.extent(sceneData, d => d.date));
    y.domain([d3.min(sceneData, d => d.value) - 2, d3.max(sceneData, d => d.value) + 2]);

    // draw axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));

    // x-axis label
    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Year");

    // y-axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("CO₂ - parts per million (ppm)");

    // x gridlines
    g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat("")
        );

    // y gridlines
    g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // draw line
    g.append("path")
        .datum(sceneData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("stroke-dasharray", function () {
            const length = this.getTotalLength();
            return length + " " + length;
        })
        .attr("stroke-dashoffset", function () {
            return this.getTotalLength();
        })
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);

    // tooltip setup
    const tooltip = d3.select("#tooltip");

    // Circle for focus
    const focusDot = g.append("circle")
        .attr("r", 5)
        .style("fill", "black")
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .style("opacity", 0);

    // transparent rectangle to capture mouse
    const bisectDate = d3.bisector(d => d.date).left;

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function (event) {
            if (pinned) return;

            const [mx, my] = d3.pointer(event, this);
            const mouseDate = x.invert(mx);
            
            // find the closest point by date
            const i = bisectDate(sceneData, mouseDate);
            const d0 = sceneData[i - 1];
            const d1 = sceneData[i];
            const d = !d0 ? d1 : !d1 ? d0 : (mouseDate - d0.date > d1.date - mouseDate ? d1 : d0);

            const xPos = x(d.date);
            const yPos = y(d.value);

            // check if mouse is close in y-direction only
            const distanceY = Math.abs(my - yPos);
            const thresholdY = 15;

            if (distanceY < thresholdY) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("opacity", 0.9)
                    .html(`
                        <strong>${d.date.toLocaleDateString("en-US", { year: 'numeric', month: 'short' })}</strong><br/>
                        CO₂: ${d.value.toFixed(2)} ppm
                    `);
                focusDot
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .style("opacity", 1);
            } else {
                tooltip.style("opacity", 0);
                focusDot.style("opacity", 0);
            }
        })
        .on("click", function (event) {
            pinned = !pinned;

            // if unpinning, hide tooltip
            if (!pinned) {
                tooltip.style("opacity", 0);
                focusDot.style("opacity", 0);
            }
        })
        .on("mouseout", function () {
            if (!pinned) {
                tooltip.style("opacity", 0);
                focusDot.style("opacity", 0);
            }
        });

    // add annotations to the charts
    if (scene === 0) {
        // annotation circle
        g.append("circle")
            .attr("cx", x(sceneData[0].date))
            .attr("cy", y(sceneData[0].value))
            .attr("r", 5)
            .attr("fill", "red");

        const xPos = x(sceneData[0].date);
        const yPos = y(sceneData[0].value);

        // ppm label
        g.append("text")
            .attr("x", xPos + 35)
            .attr("y", yPos - 70)
            .attr("text-anchor", "middle")
            .text("315 ppm")
            .style("fill", "red");

        // year label
        g.append("text")
            .attr("x", xPos + 30)
            .attr("y", yPos - 50)
            .attr("text-anchor", "middle")
            .text("(1958)")
            .style("fill", "red");
    }

    if (scene === 1) {
        const milestoneYears = [1988, 2015, 2022];
        milestoneYears.forEach(targetYear => {
            // find the closest matching data point for that year
            const match = sceneData.find(d => d.date.getFullYear() === targetYear);
            if (match) {
                const xPos = x(match.date);
                const yPos = y(match.value);

                // annotation circle
                g.append("circle")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", 0)
                    .attr("fill", "crimson")
                    .transition()
                    .duration(2000)
                    .attr("r", 5);

                // ppm label
                g.append("text")
                    .attr("x", xPos - 30)
                    .attr("y", yPos - 35)
                    .attr("text-anchor", "middle")
                    .text(`${match.value.toFixed(1)} ppm`)
                    .style("fill", "crimson");

                // year label
                g.append("text")
                    .attr("x", xPos - 30)
                    .attr("y", yPos - 15)
                    .attr("text-anchor", "middle")
                    .text(`(${targetYear})`)
                    .style("fill", "crimson");
            }
        });
    }

    if (scene === 2) {
        const match = sceneData.find(d => d.date.getFullYear() === 2015);
        if (match) {
            const xPos = x(match.date);
            const yPos = y(match.value);

            // annotation circle
            g.append("circle")
                .attr("cx", xPos)
                .attr("cy", yPos)
                .attr("r", 0)
                .attr("fill", "darkred")
                .transition()
                .duration(2000)
                .attr("r", 5);

            // ppm label
            g.append("text")
                .attr("x", xPos - 30)
                .attr("y", yPos - 40)
                .attr("text-anchor", "middle")
                .text(`${match.value.toFixed(1)} ppm`)
                .style("fill", "darkred");

            // year label
            g.append("text")
                .attr("x", xPos - 30)
                .attr("y", yPos - 20)
                .attr("text-anchor", "middle")
                .text(`(2015)`)
                .style("fill", "darkred");
        }
    }

    if (scene === 3) {
        const milestoneYears = [1980, 1988, 2015, 2022];
        milestoneYears.forEach(targetYear => {
            const match = sceneData.find(d => d.date.getFullYear() === targetYear);
            if (match) {
                const xPos = x(match.date);
                const yPos = y(match.value);

                // annotation circle
                g.append("circle")
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("r", 0)
                    .attr("fill", "indigo")
                    .transition()
                    .duration(2000)
                    .attr("r", 5);

                // ppm label
                g.append("text")
                    .attr("x", xPos - 30)
                    .attr("y", yPos - 35)
                    .attr("text-anchor", "middle")
                    .text(`${match.value.toFixed(1)} ppm`)
                    .style("fill", "indigo");

                // year label
                g.append("text")
                    .attr("x", xPos - 30)
                    .attr("y", yPos - 15)
                    .attr("text-anchor", "middle")
                    .text(`(${targetYear})`)
                    .style("fill", "indigo");
            }
        });
    }

    d3.select("#scene-text").text(text);
}
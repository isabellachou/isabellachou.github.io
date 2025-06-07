// Scene 1 logic
let scene = 0;
let data;

function init() {
    d3.csv("data/co2_mm_mlo.csv").then(raw => {
        data = raw.map(d => ({
            date: new Date(+d.year, +d.month - 1),
            value: +d.interpolated
        })).filter(d => !isNaN(d.value));

        renderScene();
        d3.select("#next").on("click", () => {
            scene++;
            renderScene();
        });
    });
}

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

    if (scene === 0) {
        // scene 1: early years
        text = "In 1958, atmospheric CO₂ was 315 ppm. Monitoring at Mauna Loa begins.";
        sceneData = data.filter(d => d.date.getFullYear() <= 1970);

        console.log("Scene data length:", sceneData.length);
        console.log(sceneData.slice(0, 5));  // preview first few data points
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
        .text("CO₂ (ppm)");


    // draw line
    g.append("path")
        .datum(sceneData)
        .attr("fill", "none")
        .attr("stroke", "darkpink") //diff
        .attr("stroke-width", 2)
        .attr("d", line);

    // draw annotation
    g.append("circle")
        .attr("cx", x(sceneData[0].date))
        .attr("cy", y(sceneData[0].value))
        .attr("r", 5)
        .attr("fill", "brown");

    g.append("text")
        .attr("x", x(sceneData[0].date) + 10)
        .attr("y", y(sceneData[0].value) - 10)
        .text("315 ppm (1958)")
        .style("fill", "brown");

    d3.select("#scene-text").text(text);
}



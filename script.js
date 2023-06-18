
// set the dimensions and margins of the graph
var width = 800
var height = window.screen.availHeight
var boxes = 100

var myVarInput = document.getElementById("nValue");
var myVarInput2 = document.getElementById("mValue");
var cluster = document.getElementById("cluster");
var sort_by_temp = document.getElementById("sort_by_temp");
var sort_by_diameter = document.getElementById("sort_by_diameter");
var sort_by_distance = document.getElementById("sort_by_distance");
var start_simulation = document.getElementById("simulation-check");

var buttons = document.getElementsByClassName("vis_button")

function reloadVis() {
  d3.selectAll('svg').remove()
  d3.selectAll('node').remove()
  updateVisualization(myVarInput.value, myVarInput2.value, cluster.value, sort_by_temp.checked, sort_by_diameter.checked, sort_by_distance.checked, start_simulation.checked);
}

Array.from(buttons).forEach(function(element) {
  element.addEventListener('click', reloadVis);
});

// Read data
function updateVisualization(myVarValue, myVarValue2, cluster, sort_by_temp, sort_by_distance, sort_by_diameter, start_simulation, show_diameter) {
  d3.csv("star_data.csv", function (data) {

    data = data.filter(function (d) { return Number(d.distance_l) >= myVarValue })
    data = data.filter(function (d) { return Number(d.distance_l) < myVarValue2 })
    data = data.filter(function (d) { return Number(d.distance_l) < 1000 })
    data = data.filter(function (d) { return Number(d.diameter) < 200 })
    data = data.filter(function (d) { return Number(d.star_temp) != 0 })


    if (sort_by_temp) {
      data = data.sort(function (a, b) { return b.star_temp - a.star_temp; })
    } else if (sort_by_distance) {
      data = data.sort(function (a, b) { return a.diameter - b.diameter; })
    } else if (sort_by_diameter) {
      data = data.sort(function (a, b) { return a.distance_l - b.distance_l; })
    }

    var color = d3.scaleOrdinal()
    .range(d3.schemeSet1);

    var colorScale = d3.scaleSequential()
      .domain([3500, 10000]) 
      .interpolator(d3.interpolateRdYlBu);

    var size = d3.scaleLinear()
      .domain([0, 150])
      .range([5, 80])


    var Tooltip = d3.select("#my_dataviz")
      .append("div")
      .style("color", "white")
      .style("position", "fixed")
      .style("opacity", 0)
      .style("bottom", "40px")
      .attr("class", "tooltip")
      .style("border-radius", "10px")


    var mousemove = function (d) {
      Tooltip
        .html('<u>' + d.star_name + '</u>' +
          "<br>" + "<b>Diâmetro: </b>" + d.diameter + " vezes o tamanho do sol" +
          "<br>" + "<b>Distância: </b>" + d.distance_l + " Anos Luz" +
          "<br>" + "<b>Temperatura: </b>" + d.star_temp + " Kelvin" +
          "<br>" + "<b>Magnitude Absoluta: </b>" + d.mag +
          "<br>" + "<b>Magnitude Aparente: </b>" + d.mag_a)
    }

    var mouseover = function (d) {
      Tooltip
        .style("opacity", 1)
    }

    var mouseleave = function () {
      Tooltip
        .style("opacity", 0)
    }

    var d = cluster;
    var width = cluster * 30 + 800;
    var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]

    var svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    var x = d3.scaleOrdinal()
      .range(a.map(x => x * d))

    var mapin = d3.scaleLinear()
      .domain([9000, 3000])
      .range([-width / 2 + 50, width / 2 - 50])


    var mapin2 = d3.scaleLinear()
      .domain([-10, 20])
      .range([-height / 2, height / 2])

    var mapin3 = d3.scaleLinear()
      .domain([-10, 20])
      .range([-height / 2, height / 2])


    var node = svg.append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", function (d) { return size(d.diameter) })
      .style("fill", function (d) { return color(+d.distance_type); })
      .style("fill", function (d) { return colorScale(+d.star_temp); })
      .style("fill-opacity", 0.95)
      .attr("stroke", "black")
      .attr("fill", "white")
      .style("stroke-width", 2)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(d3.drag() 
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    var simulation1 = d3.forceSimulation()
      .force("x", d3.forceX().strength(0.15).x(function (d) { return x(d.distance_type) }))
      .force("y", d3.forceY().strength(0.15).y(height / 2))
      .force("center", d3.forceCenter().x(width / 2).y(height / 2))
      .force("charge", d3.forceManyBody().strength(-13))
      .force("collide", d3.forceCollide().strength(.2).radius(function (d) { return (size(d.diameter) + 3) }).iterations(1)); 

    var simulation2 = d3.forceSimulation()
      .force("x", d3.forceX().strength(0.1).x(function (d) { return (width / 2 + mapin(+d.star_temp)) }))
      .force("y", d3.forceY().strength(0.1).y(function (d) { return (height / 2 + mapin2(+d.mag)) }))
      .force("charge", d3.forceManyBody().strength(-0.15))


    if (start_simulation) {
      simulation2
        .nodes(data)
        .on("tick", function (d) {
          node
            .attr("cx", function (d) { return d.x; }) 
            .attr("cy", function (d) { return d.y; })
        });
        
    } else {
      simulation1
        .nodes(data)
        .on("tick", function (d) {
          node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
        });
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(.03);
      d.fx = null;
      d.fy = null;
    }

  });

}

updateVisualization(myVarInput.value, myVarInput2.value, cluster.value, sort_by_temp.checked, sort_by_diameter.checked, sort_by_distance.checked, start_simulation.checked);



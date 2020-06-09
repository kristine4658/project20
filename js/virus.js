var margin4 = {top: 10, right: 20, bottom: 110, left: 70},
    width4 = 600 - margin4.left - margin4.right,
    height4 = 450 - margin4.top - margin4.bottom;

// append the svg object to the body of the page
var line1 = d3.select("#line1")
  .append("svg")
    .attr("width", width4 + margin4.left + margin4.right)
    .attr("height", height + margin4.top + margin4.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin4.left + "," + margin4.top + ")");

var label = line1

// Initialise a X axis:
var vx = d3.scaleLinear().range([0,width4]);
var vxAxis = d3.axisBottom().scale(vx);
line1.append("g")
  .attr("transform", "translate(0," + height4 + ")")
  .attr("class","myXaxis")

// Initialize an Y axis
var y1 = d3.scaleLinear().range([height4, 0]);
var y1Axis = d3.axisLeft().scale(y1);
line1.append("g")
  .attr("class","myY1axis")

var y2 = d3.scaleLinear().range([height4, 0]);
var y2Axis = d3.axisRight().scale(y2);
line1.append("g")
    .attr("class","myY2axis")

  line1.append("text")             
    .attr("transform",
          "translate(" + (width4) + " ," + 
                          (height4 + margin4.top + 20) + ")")
    .attr("font-family", "arial")
    .attr("font-size", "12px")
    .style("text-anchor", "middle")
    .text("Day");
  
  line1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin4.left)
    .attr("x",0 - (height4 / 8))
    .attr("dy", "1em")
    .attr("font-family", "arial")
    .attr("font-size", "12px")
    .style("text-anchor", "middle")
    .text("Population(k)");   

var dataSet;
d3.csv(covid, function(data){
    dataSet = data; 
})

// Create a function that takes a dataset as input and update the plot:
function update(raw) {

  d3.csv(raw, function(data){
  // Create the X axis:
  vx.domain([0, d3.max(data, function(d) { return +d.Day }) ]);
  line1.selectAll(".myXaxis").transition()
    .duration(300)
    .call(vxAxis);

  // create the Y axis
  y1.domain([0, d3.max(data, function(d) { return +d.Cumulative/1000  }) ]);
  y2.domain([0, d3.max(dataSet, function(d) { return +d.Cumulative/1000  }) ]);
  
  line1.selectAll(".myY1axis")
    .transition()
    .duration(300)
    .call(y1Axis)
    .selectAll("text")
    .style("fill", "steelblue")

  line1.selectAll(".myY2axis")
    .transition()
    .duration(300)
    .call(y2Axis)
    .selectAll("text")
    .style("fill", "lightcoral")    

  // Create a update selection: bind to the new data
  var u = line1.selectAll(".lineTest1")
    .data([data], function(d){ return +d.Day });
  var u2 = line1.selectAll(".lineTest2")
    .data([dataSet], function(d){ return +d.Day });

  // Updata the line
  u
    .enter()
    .append("path")
    .attr("class","lineTest1")
    .merge(u)
    .transition()
    .duration(300)
    .attr("d", d3.line()
      .x(function(d) { return vx(d.Day); })
      .y(function(d) { return y1(d.Cumulative/1000); }))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5)

   u2
   .enter()
   .append("path")
   .attr("class","lineTest2")
   .merge(u2)
   .transition()
   .duration(300)
   .attr("d", d3.line()
     .x(function(d) { return vx(d.Day); })
     .y(function(d) { return y2(d.Cumulative/1000); }))
     .attr("fill", "none")
     .attr("stroke", "lightcoral")
     .attr("stroke-width", 2.5)
    
  })
}

// At the beginning, I run the update function on the first dataset:
update(covid)
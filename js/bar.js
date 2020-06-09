var formatDateIntoYear = d3.timeFormat("%b %d");
var formatDate = d3.timeFormat("%b %d");
var formatOfficial = d3.timeFormat("%Y-%m-%d");
var parseDate = d3.timeParse("%Y-%m-%d");

var margin = {top:0, right:50, bottom:0, left:50},
    width = 1000 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var play = d3.select("#play")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);  

////////// slider //////////

var playButton = d3.select("#play-button");

var slider = play.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height/5 + ")");

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var margin2 = {top:20, right:20, bottom:0, left:20},
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 500 - margin2.top - margin2.bottom;

// map
var map = d3.select("#map")
  .append("svg")
  .attr("width", width2 + margin2.left + margin2.right)
  .attr("height", height2 + margin2.top + margin2.bottom);

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(120)
  .center([0,45])
  .translate([width2 / 2, height2 / 2]);

// Data and color scale
var data1 = d3.map();
var data2 = d3.map();
var dataFilter;
var colorScale = d3.scaleThreshold()
  .domain([0, 10, 100, 1000, 10000, 100000, 1000000])
  .range(d3.schemeReds[7]);
// var colorScale2 = d3.scaleSequential(d3.interpolatePurples)
//   .domain([0, 1000000])

//legend
var cx = d3.scaleLinear()
  .domain([0, 7])
  .range([750, 950]);
var cxcolor = d3.scaleThreshold()
  .domain(d3.range(0,7))
  .range(d3.schemeReds[7]);

var g = map.append("g")
  .attr("class", "key")
  .attr("transform", "translate(0,40)");

g.selectAll("rect")
.data(colorScale.range().map(function(d) {
    d = cxcolor.invertExtent(d);
    if (d[0] == null) d[0] = cx.domain()[0];
    if (d[1] == null) d[1] = cx.domain()[1];
    return d;
  }))
.enter().append("rect")
  .attr("height", 8)
  .attr("x", function(d) { return cx(d[0]); })
  .attr("width", function(d) { return cx(d[1]) - cx(d[0]); })
  .attr("fill", function(d) { return cxcolor(d[0]); });

g.append("text")
  .attr("class", "caption")
  .attr("x", cx.range()[0])
  .attr("y", -6)
  .attr("fill", "#000")
  .attr("text-anchor", "start")
  .attr("font-weight", "bold")
  .text("Population(k)");

g.call(d3.axisBottom(cx)
  .tickSize(13)
  .tickFormat(
    function(i) {
      var ret = 10**i/1000; 
      if(ret == 1000)
        return ret + "~";
      else if(ret == 0.001)
        return "~" + ret;
      return ret; 
    })
  .tickValues(cxcolor.domain()))
.select(".domain")
  .remove();
///// legend until here  

// set the dimensions and margins of the graph
var margin3 = {top:10, right:20, bottom:100, left:50},
    width3 = 1000 - margin3.left - margin3.right,
    height3 = 250 - margin3.top - margin3.bottom;

// append the svg object to the body of the page
var bar = d3.select("#bar")
  .append("svg")
    .attr("width", width3 + margin.left + margin3.right)
    .attr("height", height3 + margin.top + margin3.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin3.left + "," + margin3.top + ")");

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
//  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.name, +d.pop); })
  .defer(d3.csv, mdata, function(d) { 
      data1.set(d.Code, d.Entity);
      return {
          country: d.Entity,
          date: d.Date,
          code: d.Code,
          value: +d.pop
      }
  })

  .await(ready);

function ready(error, topo, data) {

console.log(data);

  var startDate = new Date(d3.min(data, d=>d.date)),
  endDate = new Date(d3.max(data, d=>d.date));

  var moving = false;
  var currentValue = 0;
  var targetValue = width;

  var forColor = data.filter(function(d){return d.date=="2019-01-31"});

  var colorScale2 = d3.scaleOrdinal(d3.schemeCategory10)
  .domain(forColor.map(function(d){return d.country}));

  var x = d3.scaleTime()
    .domain(d3.extent(data, d=>d3.timeParse("%Y-%m-%d")(d.date)))
    .range([0, targetValue])
    .clamp(true);
    console.log(x);

  slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
            currentValue = d3.event.x;
            update(x.invert(currentValue)); 
        })
    );
    console.log(x.invert(currentValue));
  slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

  var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);
    
  var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

  let mouseOver = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .5)
    d3.select(this)
      .transition()
      .duration(200)
      .style("opacity", 1)
    div.transition()		
        .duration(200)		
        .style("opacity", .9);		
    div .html(data1.get(d.id)+ " : " +data2.get(d.id))	
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");	
  }

  let mouseLeave = function(d) {
    d3.selectAll(".Country")
      .transition()
      .duration(200)
      .style("opacity", .8)
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "transparent")
  }

    // Draw the map
  function drawMap(){
    map.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data2.get(d.id) || 0;
        return colorScale(d.total);
      })
      .style("stroke", "transparent")
      .attr("class", function(d){ return "Country" } )
      .style("opacity", .8)
      .on("mouseover", mouseOver )
      .on("mouseleave", mouseLeave )
    }

  function topThirty(arrayData){  //sorting to top 3 function
    arrayData.sort(function(a, b) {
                      return b.value - a.value;
                    });
    return arrayData.slice(0, 20); 
  }

  var bx = d3.scaleBand()
    .range([ 0, width3 ])
    .padding(0.2);
  var xAxis = bar.append("g")
    .attr("transform", "translate(0," + height3 + ")")

  var by = d3.scaleLinear()
    .range([ height3, 0]);
  var yAxis = bar.append("g")
    .attr("class", "myYaxis")

  function drawBar(bdata){
        
    bx.domain(bdata.map(function(d) { return d.country; }))
    xAxis.call(d3.axisBottom(bx))
         .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

    by.domain([0, d3.max(bdata, function(d) { return d.value }) ]);
    yAxis.transition().duration(200).call(d3.axisLeft(by));

    var u = bar.selectAll("rect")
    .data(bdata)

    u
    .enter()
    .append("rect") // Add a new rect for each new elements
    .merge(u) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(200)
      .attr("x", function(d) { return bx(d.country); })
      .attr("y", function(d) { return by(d.value); })
      .attr("width", bx.bandwidth())
      .attr("height", function(d) { return height3 - by(d.value); })
      .attr("fill", "#69b3a2")
      .attr("fill", function (d) {
        return colorScale2(d.country);
      })

    u
    .exit()
    .remove()
  }
      
    

    drawMap();
  
  playButton
    .on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      // timer = 0;
      button.text("Play");
    } else {
      moving = true;
      timer = setInterval(step, 100);
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  })

  function step() {
    update(x.invert(currentValue));
    console.log(x.invert(currentValue));
    currentValue = currentValue + (targetValue/151);
    if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        // timer = 0;
        playButton.text("Play");
        console.log("Slider moving: " + moving);
    }
 }
 
 function update(h) {

    console.log(formatDate(h));

    handle.attr("cx", x(h));
    label
    .attr("x", x(h))
    .text(formatDate(h));

    dataFilter = data.filter(function(d){return d.date==formatOfficial(h)});
    data2.clear();
    d3.map(dataFilter, function(d){data2.set(d.code, d.value);});
    var newData = topThirty(dataFilter);

    // filter data set and redraw plot
    // var newData = check.filter(function (d){
    //     return d.Date == h; 
    // })
//    var nwData = d3.map();
//    nwData.set(newData.Code, newData.pop);
    drawMap();
    drawBar(newData);
}

}


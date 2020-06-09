// set the dimensions and margins of the graph
var margin5 = {top: 20, right: 20, bottom: 110, left: 70},
    width5 = 600 - margin5.left - margin5.right,
    height5 = 400 - margin5.top - margin5.bottom;

// append the svg object to the body of the page
var obj = d3.select("#line2")
  .append("svg")
    .attr("width", width5 + margin5.left + margin5.right)
    .attr("height", height5 + margin5.top + margin5.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin5.left + "," + margin5.top + ")");

var duration = 250;

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";

var lx = d3.scaleLinear().range([ 0, width5 ]);
var lxAxis = d3.axisBottom().scale(vx);
obj.append("g")
    .attr("transform", "translate(0," + height5 + ")")
    .attr("class", "lXaxis")

var liy = d3.scaleLinear().range([ height5, 0 ]);
var liyAxis = d3.axisLeft().scale(liy);

var loy =d3.scaleLog().range([ height5, 0 ]);
var loyAxis = d3.axisLeft().scale(loy);
obj.append("g")
    .attr("class", "lYaxis")

selectType(0);
  // Add Y axis
  function selectType(v){

    d3.csv(ldata, function(data){

    ///Mouse Movement
    let mouseOver1 = function(d, i){
        obj.append("text")
            .attr("class", "title-text")
            .style("fill", color(i))        
            .text(d.key)
            .attr("text-anchor", "middle")
            .attr("x", width5/4)
            .attr("y", height5/2);
        }
    let mouseOut1 = function(d) {
        obj.select(".title-text").remove();
    }
    let mouseOver2 = function(d) {
        d3.selectAll('.line')
                        .style('opacity', otherLinesOpacityHover);
        d3.select(this)
            .style('opacity', lineOpacityHover)
            .style("stroke-width", lineStrokeHover)
            .style("cursor", "pointer");
    }
    let mouseOut2 = function(d) {
        d3.selectAll(".line")
                        .style('opacity', lineOpacity);
        d3.select(this)
            .style("stroke-width", lineStroke)
            .style("cursor", "none");
    }

    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.Entity;})
        .entries(data);

    // Add X axis --> it is a date format
    
    lx.domain([0, d3.max(data, function(d) { return +d.Day; })]);
    obj.selectAll(".lXaxis").transition()
       .duration(300)
       .call(lxAxis);

    
    liy.domain([0.1, d3.max(data, function(d) { return +d.pop/1000; })]);
    loy.domain([0.1, d3.max(data, function(d) { return +d.pop/10; })]);

        // color palette
    var res = sumstat.map(function(d){ return d.key }) // list of group names
    var color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(res);

    var line = d3.line()
    // var lines1 = obj.selectAll("rect")
    //                .data(sumstat)
    //                .enter()
    //                .append('g')
    //                .attr('class', 'line-group1')  
    //                .on("mouseover", mouseOver1)
    //                .on("mouseout", mouseOut1)
    //                .append('path')
    //                .attr('class', 'line1')  
    //                .attr('d', d => line1(d.values))
    //                .style('stroke', (d, i) => color(i))
    //                .style('fill', 'none')
    //                .style('opacity', lineOpacity)
    //                .on("mouseover", mouseOver2)
    //                .on("mouseout", mouseOut2);

    var lines = obj.selectAll("rect")
                   .data(sumstat)
    

    if(v==0){
    obj.selectAll('.line-group').remove();
    obj.selectAll(".lYaxis")
        .transition()
        .duration(duration)
        .call(liyAxis);
    line
        .x(d => lx(d.Day))
        .y(d => liy(d.pop/1000));
    
    }
    else{
    obj.selectAll('.line-group').remove();
    obj.selectAll(".lYaxis")
        .transition()
        .duration(duration)
        .call(loyAxis);
    line
        .x(d => lx(d.Day))
        .y(d => loy(d.pop/10));
    
    }

    lines
      .enter()
      .append('g')
      .attr('class', 'line-group')  
      .on("mouseover", mouseOver1)
      .on("mouseout", mouseOut1)
      .append('path')
      .attr('class', 'line')  
      .attr('d', d => line(d.values))
      .style('stroke', (d, i) => color(i))
      .style('fill', 'none')
      .style('opacity', lineOpacity)
      .on("mouseover", mouseOver2)
      .on("mouseout", mouseOut2);


    })

  }


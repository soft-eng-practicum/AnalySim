import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

  @Input() data : any;
  @Input() columnXName : string;
  @Input() columnYName : string;

  private svg: any;
  private margin = 50;
  private width = 850 - this.margin * 2;
  private height = 600 - this.margin * 2;
  private xScale: any;
  private yScale: any;
  label: string = "";
  value : string = "";

  @Input() columnDataTypes: any;

  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.createScales();
    this.drawAxesLabels(); 
    }

  ngOnChanges(changes) {
    this.createSvg();
    this.createScales();
    this.drawAxesLabels(); 
  }

  private createSvg(): void {
    d3.select("figure#histogram").selectAll("*").remove();
    this.svg = d3.select("figure#histogram")
    .append("svg")
    .attr("width", this.width + this.margin * 2)
    .attr("height", this.height + this.margin * 2)
    .append("g")
    .attr("transform", `translate(${this.margin}, ${this.margin})`);
  }

  findMinimumX(accumulator, currentValue)
  {
    if (currentValue.x)
      return Math.min(accumulator, currentValue.x);
    else
      return Math.min(accumulator, 0);
  }

  findMaximumX(accumulator, currentValue)
  {
    if (currentValue.x)
      return Math.max(accumulator, currentValue.x);
    else
      return Math.max(accumulator, 0);
  }

  findMinimumY(accumulator, currentValue)
  {
    if (currentValue.y)
      return Math.min(accumulator, currentValue.y);
    else
      return Math.min(accumulator, 0);
  }

  findMaximumY(accumulator, currentValue)
  {
    if (currentValue.y)
      return Math.max(accumulator, currentValue.y);
    else
      return Math.max(accumulator, 0);
  }

  private createScales(): void {
  // X axis: scale and draw:
    var groupedData = {};
    this.data.forEach(d => {

      if (this.columnDataTypes[this.columnXName] === "text") {
        if (d.x) {
          if (groupedData[d.x] === undefined) {
            groupedData[d.x] = [(this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0))];
          }
          else {
            groupedData[d.x].push((this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0)));
          }
        }
          else {
          if (groupedData["null"] === undefined) {
            groupedData["null"] = [(this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0))];
          }
          else {
            groupedData["null"].push((this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0)));
          }
        }
      }
      else {
        if (d.x) {
          if (groupedData[d.x] === undefined) {
            groupedData[d.x.toString()] = [(this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0))];
          }
          else {
            groupedData[d.x.toString()].push((this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0)));
          }
        }
        else {
          if (groupedData["0"] === undefined) {
            groupedData["0"] = [(this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0))];
          }
          else {
            groupedData["0"].push((this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y : "null") : (d.y ? d.y : 0)));
          }
        }
      }
    })
  var x =     x = d3.scaleBand()
    .range([this.height, 0])
    .domain(Object.keys(groupedData))
  .padding(0.2);

  this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

  var y = null;
    var subGroups = {};
  if(this.columnDataTypes[this.columnYName]==="text")
  {
  y= d3.scaleBand()
    .range([ this.height, 0 ])
    .domain(this.data.map(function (d) { if (d.y) { return d.y.toString(); } else { return "null" } }))
    .padding(0.2);

    this.data.forEach(d => {
      if (d.y) {
        if (subGroups[d.y.toString()] === undefined) {
          subGroups[d.y.toString()] = 1;
        }
        else {
          subGroups[d.y.toString()] += 1;
        }
      }
      else {
        if (subGroups["null"] === undefined) {
          subGroups["null"] = 1;
        }
        else {
          subGroups["null"] += 1;
        }
      }
    })
  }
  else{
    y = d3.scaleLinear()
      .range([this.height, 0])
      .domain([this.data.reduce(this.findMinimumY, this.data[0].y ? this.data[0].y : 0), this.data.reduce(this.findMaximumY, this.data[0].y ? this.data[0].y : 0)])

    this.data.forEach(d => {
      if (d.y) {
        if (subGroups[d.y] === undefined) {
          subGroups[d.y] = 1;
        }
        else {
          subGroups[d.y] += 1;
        }
      }
      else {
        if (subGroups[0] === undefined) {
          subGroups[0] = 1;
        }
        else {
          subGroups[0] += 1;
        }
      }
    })

  }

    var subGroupArray = [];
    for (const key of Object.keys(subGroups)) {
      subGroups[key].
      subGroupArray.push(key);
    }

    var xSubgroup = d3.scaleBand()
      .domain(subGroupArray)
      .range([0, x.bandwidth()])
      .padding(0.05)

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(subGroupArray)
      .range(['#e41a1c', '#377eb8', '#4daf4a'])
    
  this.svg.append("g")
    .call(d3.axisLeft(y));

  const tooltip = d3.select("figure#histogram")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "black")
  .style("color", "white")
  .style("border-radius", "5px")
  .style("padding", "10px")
  

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
const showTooltip = (event,d) => {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 1)
  tooltip
    .html("X: " + (d.x ? d.x.toString() : "null") + " - Y: " + (this.columnDataTypes[this.columnYName] === "text" ? (d.y ? d.y.toString() : "null") : (d.y ? d.y : "0")))
    .style("left", (event.x) + "px")
    .style("top", (event.y) + "px")
}
const moveTooltip = function(event,d) {
  tooltip
  .style("left", (event.x) + "px")
  .style("top", (event.y) + "px")
}
// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
const hideTooltip = function(event,d) {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 0)
}


/*this.svg.selectAll("mybar")
.data(this.data)
.enter()
.append("rect")
  .attr("x", (d) => { return x(d.x ? d.x.toString() : "null"); })
  .attr("y", (d) => { return y(this.columnDataTypes[this.columnYName] === "text" ? d.y ? d.y.toString() : "null" : d.y ? d.y : 0) })
  .attr("width", x.bandwidth())
  .attr("height", (d) => { return this.height - y(this.columnDataTypes[this.columnYName] === "text" ? d.y ? d.y.toString() : "null" : d.y ? d.y : 0); })
  .attr("fill", "#" + Math.floor(Math.random() * 16777215).toString(16))
  .on("mouseover", showTooltip )
  .on("mousemove", moveTooltip )
  .on("mouseleave", hideTooltip)*/

 this.svg.append("g")
      .selectAll("g")
   // Enter in data = loop group per group
   .data(Object.keys(groupedData))
      .enter()
      .append("g")
   .attr("transform", function (d) { return "translate(" + x(d) + ",0)"; })
   .selectAll("rect")
   .data(function (d) { return groupedData[d].map(function (key) { return { key: key, value: key }; }); })
      .enter().append("rect")
      .attr("x", function (d) { return xSubgroup(d.key); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", (d) => { return this.height - y(d.value); })
      .attr("fill", function (d) { return color(d.key); });

  }

  private drawAxesLabels(): void {
    // Bottom Label ("value")
    this.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", this.width / 2)
      .attr("y", this.height + this.margin / 1.5)  // Adjust the position below the x-axis
      .text(this.columnXName);

    // Left Label ("frequency")
    this.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")  // Rotate the text to be vertical
      .attr("y", -this.margin / 1.5)  // Position it to the left of y-axis
      .attr("x", -this.height / 2)  // Center it vertically in the middle of the histogram
      .text(this.columnYName);
  }

}

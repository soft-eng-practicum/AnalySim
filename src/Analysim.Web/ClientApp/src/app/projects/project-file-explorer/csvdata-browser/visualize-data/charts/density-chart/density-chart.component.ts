import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-density-chart',
  templateUrl: './density-chart.component.html',
  styleUrls: ['./density-chart.component.scss']
})
export class DensityChartComponent implements OnInit {

  @Input() data : any;
  @Input() columnName : string;

  private svg: any;
  private margin = 50;
  private width = 850 - this.margin * 2;
  private height = 600 - this.margin * 2;
  private xScale: any;
  private yScale: any;
  label: string = "";
  value : string = "";

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

  private createScales(): void {

  // X axis: scale and draw:
  var x : any = d3.scaleBand()
  .range([ 0, this.width ])
  .domain(this.data.map(function(d) { return d.x.toString(); }))
  .padding(0.2);
  this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

  let frequencyMap={};    
  let maxValue = 0;
  const findFrequency = () =>{
    this.data.forEach(record=>{
      if(frequencyMap[record.x]===undefined)
      {
        frequencyMap[record.x.toString()] = 1;
      }
      else{
        frequencyMap[record.x.toString()]+=1;
      }
      maxValue = Math.max(maxValue,frequencyMap[record.x]);
    })
  }

  findFrequency();

  var y = d3.scaleLinear()
  .range([this.height, 0]);
  y.domain([0, maxValue]);   // d3.hist has to be called before the Y axis obviously

  this.svg.append("g")
  .call(d3.axisLeft(y));

  let bins = [];

  console.log(frequencyMap);

  for(const key of Object.keys(frequencyMap))
  {
    bins.push(
      {
        x: key,
        y: frequencyMap[key]
      }
    )
  }

  console.log(bins);

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
const showTooltip = function(event,d) {
  tooltip
    .transition()
    .duration(100)
    .style("opacity", 1)
  tooltip
    .html("X: " + d.x + " - Frequency: " + d.y)
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

  this.svg.selectAll("rect")
  .data(bins)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) { return y(d.y); })
    .attr("width", x.bandwidth())
    .attr("height", (d) => { return this.height - y(d.y); })
    .attr("fill", "#69b3a2")
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )
  }

  private drawAxesLabels(): void {
    // Bottom Label ("value")
    this.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", this.width / 2)
      .attr("y", this.height + this.margin / 1.5)  // Adjust the position below the x-axis
      .text(this.columnName);

    // Left Label ("frequency")
    this.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")  // Rotate the text to be vertical
      .attr("y", -this.margin / 1.5)  // Position it to the left of y-axis
      .attr("x", -this.height / 2)  // Center it vertically in the middle of the histogram
      .text("Frequency");
  }
}

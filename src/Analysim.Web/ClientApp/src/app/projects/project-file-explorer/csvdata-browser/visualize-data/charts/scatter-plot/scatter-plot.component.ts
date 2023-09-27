import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss']
})
export class ScatterPlotComponent implements OnInit {

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
    d3.select("figure#scatterplot").selectAll("*").remove();
    this.svg = d3.select("figure#scatterplot")
    .append("svg")
    .attr("width", this.width + this.margin * 2)
    .attr("height", this.height + this.margin * 2)
    .append("g")
    .attr("transform", `translate(${this.margin}, ${this.margin})`);
  }

  findMinimumX(accumulator, currentValue)
  {
      return Math.min(accumulator,currentValue.x);
  }

  findMaximumX(accumulator, currentValue)
  {
      return Math.max(accumulator,currentValue.x);
  }

  findMinimumY(accumulator, currentValue)
  {
      return Math.min(accumulator,currentValue.y);
  }

  findMaximumY(accumulator, currentValue)
  {
      return Math.max(accumulator,currentValue.y);
  }

  private createScales(): void {
  // X axis: scale and draw:
  var x= d3.scaleLinear()
    .range([ 0, this.width ])
    .domain([this.data.reduce(this.findMinimumX,this.data[0].x),this.data.reduce(this.findMaximumX,this.data[0].x)])

  this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .range([ this.height, 0 ])
    .domain([this.data.reduce(this.findMinimumY,this.data[0].y),this.data.reduce(this.findMaximumY,this.data[0].y)])
    
  this.svg.append("g")
      .call(d3.axisLeft(y));
  
  
      const tooltip = d3.select("figure#scatterplot")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
  
  
  
    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const mouseover = function(event, d) {
      tooltip
        .style("opacity", 1)
    }
  
    const mousemove = function(event, d) {
      tooltip
        .html("x:" + d.x + " - y:" + d.y)
        .style("left", (event.x+15) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (event.y) + "px")
    }
  
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const mouseleave = function(event,d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }
  

    this.svg.append('g')
      .selectAll("dot")
      .data(this.data) // the .filter part is just to keep a few dots on the chart, not all of them
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
        .style("stroke", "white")
      .on("mouseover", mouseover )
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave )
  



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

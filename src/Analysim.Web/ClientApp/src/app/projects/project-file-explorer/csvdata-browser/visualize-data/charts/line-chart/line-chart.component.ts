import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit  {

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
    d3.select("figure#linechart").selectAll("*").remove();
    this.svg = d3.select("figure#linechart")
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

  var bisect = d3.bisector(function(d: any) { return d.x; }).left;

  var focus = this.svg
  .append('g')
  .append('circle')
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 8.5)
    .style("opacity", 0)

  var focusText = this.svg
  .append('g')
  .append('text')
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle")
  

  // Add the line
  this.svg
    .append("path")
    .datum(this.data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d : any) { return x(d.x) })
      .y(function(d : any) { return y(d.y) })
      )

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  this.svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', this.width)
    .attr('height', this.height)
    .on('mouseover', () => {
      focus.style("opacity", 1);
      focusText.style("opacity", 1);
    })
    .on('mousemove', (event: any) => {
      const x0 = x.invert(d3.pointer(event)[0]);
      const i = bisect(this.data, x0, 1);
      const selectedData = this.data[i];
      focus
        .attr("cx", x(selectedData.x))
        .attr("cy", y(selectedData.y));
      focusText
        .html("x:" + selectedData.x + " - y:" + selectedData.y)
        .attr("x", x(selectedData.x) + 15)
        .attr("y", y(selectedData.y));
    })
    .on('mouseout', () => {
      focus.style("opacity", 0);
      focusText.style("opacity", 0);
    });
  



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

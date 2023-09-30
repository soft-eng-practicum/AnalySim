import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { lab } from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

  @Input() data : any;

  private svg: any; 
  private margin = 50;
  private width = window.innerWidth - this.margin * 2;
  private height = window.innerHeight - this.margin * 2;
  private xScale: any;
  private yScale: any;
  label: string = "";
  value : string = "";

  @Input() columnDataTypes: any;

  @Input() xRange: any;
  @Input() yRange: any;
  @Input() columnXName: string;

  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.drawAxes();
    this.createBars();
    }

  ngOnChanges(changes) {
    this.createSvg();
    this.drawAxes();
    this.createBars();
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

  createBars(): void {
    let subGroupObject = {};

    this.data.forEach(rec => {
      for (const key of Object.keys(rec['y'])) {
        subGroupObject[key] = true;
      }

    })

    let subGroups = [];

    for (const key of Object.keys(subGroupObject)) {
      subGroups.push(key);
    }

    let xSubgroup = d3.scaleBand()
      .domain(subGroups)
      .range([0, this.xScale.bandwidth()])
      .padding(0.05)

    let color = d3.scaleOrdinal()
      .domain(subGroups)
      .range(subGroups.map(subGroup => this.getRandomColor()));

    this.svg.append("g")
      .selectAll("g")
      .data(this.data)
      .enter()
      .append("g")
      .attr("transform", (d) => { return "translate(" + this.xScale(d['x'][this.columnXName]) + ",0)"; })
      .selectAll("rect")
      .data((d) => { return subGroups.map(function (key) { return { key: key, value: d['y'][key] }; }); })
      .enter().append("rect")
      .attr("x", (d) => { return xSubgroup(d.key); })
      .attr("y", (d) => { return this.yScale(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", (d) => { return this.height - this.yScale(d.value); })
      .attr("fill", function (d) { return color(d.key); });
  }

  private drawAxes(): void {
    // Bottom Label ("value")
    this.xScale = d3.scaleBand()
      .domain(this.xRange)
      .range([0, this.width])
      .padding(0.2);

    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.xScale).tickSize(0));

    this.yScale = d3.scaleBand()
      .domain(this.yRange)
      .range([this.height, 0])
      .padding(0.2);

    this.svg.append("g")
      .call(d3.axisLeft(this.yScale));

    this.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", this.width / 2)
      .attr("y", this.height + this.margin / 1.5)  // Adjust the position below the x-axis
      .text(this.columnXName);
  }

}

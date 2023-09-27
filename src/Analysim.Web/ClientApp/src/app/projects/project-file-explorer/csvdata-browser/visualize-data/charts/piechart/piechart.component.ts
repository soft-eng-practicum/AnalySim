import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-piechart',
  templateUrl: './piechart.component.html',
  styleUrls: ['./piechart.component.scss']
})
export class PiechartComponent implements OnInit {

  @Input() data : any;

  private svg: any;
  private margin = 50;
  private width = 850;
  private height = 600;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  label: string = "";
  value : string = "";

  

  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.createColors();
    this.drawChart();
  }

  ngOnChanges(changes) {
    this.createSvg();
    this.createColors();
    this.drawChart();
  }

  private createSvg(): void {
    d3.select("figure#pie").selectAll("*").remove();
    this.svg = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
}

private createColors(): void {
  this.colors = d3.scaleOrdinal()
  .domain(this.data.map(d => d.x.toString()))
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
}

private drawChart(): void {
  // Compute the position of each group on the pie:
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

  let slices = [];

  let total = 0;

  for(const key of Object.keys(frequencyMap))
  {
    slices.push(
      {
        x: key,
        y: frequencyMap[key]
      }
    )
    total+=frequencyMap[key];
  }

  const pie = d3.pie<any>().value((d: any) => d.y);
  // Build the pie chart
  var path = this.svg
  .selectAll('pieces')
  .data(pie(slices))
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(this.radius)
  )
  .attr('fill', (d: any, i: any) => (this.colors(i)))
  .attr("stroke", "#121926")
  .style("stroke-width", "1px")
  .on("mouseover",(d,i)=>{
    this.label=i.data.x;
    const percentage = "Frequency: "+((i.data.y / total) * 100).toFixed(2);
    this.value = i.data.y + " (" + percentage + "%)";
  })
  .on("mouseout",(d,i)=>{
    this.label="";
    this.value="";
  })

  const size = 10;
  const offset = 30;
  const legend = this.svg.selectAll(".legend")
      .data(pie(this.data))
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => "translate(0," + (i * (size + 5) - this.data.length/2 * size) + ")");


}

}

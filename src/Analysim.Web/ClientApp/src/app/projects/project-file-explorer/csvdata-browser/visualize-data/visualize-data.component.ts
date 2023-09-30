import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Runtime, Inspector } from '@observablehq/runtime';


@Component({
  selector: 'app-visualize-data',
  templateUrl: './visualize-data.component.html',
  styleUrls: ['./visualize-data.component.scss']
})
export class VisualizeDataComponent implements OnInit {

  options: string[] = ['Density Plot','Pie Chart','Bar Chart','Line Chart','Scatter Plot','3D Scatter Plot'];
  twoDOptions: string[] = ['Bar Chart','Line Chart','Scatter Plot'];
  threeDOptions: string[] = ['3D Scatter Plot'];
  selectedOption: string = 'Density Chart';

  @Input() cols: string[];

  selectedXValue : string;
  selectedYValues : string[]; 
  selectedZValues: string[];
  selectedYValue: string;
  selectedZValue: string;
  

  @Output() closeModalEvent = new EventEmitter();

  @Input() data: any;

  dataToVisualize: [];

  @Input() columnDataTypes: any;

  xRange = [];
  yRange = [];
  zRange = [];

  columnXName: string = "";

  main: any = null;

  @ViewChild("notebook") observablehqPanel: ElementRef;



  constructor(private _renderer2: Renderer2) { }


  ngOnInit(): void {
    this.selectedXValue = this.cols[0];
    this.selectedYValues = [this.cols[0]];
    this.selectedZValues = [this.cols[0]];
  }

  ngAfterViewInit(): void {
  }

  closeModal(){
    this.closeModalEvent.emit();
  }

  returnZeroOrNull(columnName) {
    if (this.columnDataTypes[columnName] === "text") {
      return "null";
    }
    else {
      return "0";
    }

  }

  sortStrings(a, b)
  {
    const numA = parseFloat(a.replace(/,/g, ''));
    const numB = parseFloat(b.replace(/,/g, ''));



    // Both a and b are numbers
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    // Only a is a number
    if (!isNaN(numA)) {
      return -1;
    }

    // Only b is a number
    if (!isNaN(numB)) {
      return 1;
    }

    // Both a and b are strings
    return a.localeCompare(b);
  }


  visualizeData() {
    var x = document.getElementById("notebook");
    x.innerHTML = "";
    console.log(true);
    if (this.selectedOption === "Line Chart") {
      import("../../../../../assets/notebooks/notebook-lineplot/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "linePlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
        this.main.redefine("yColumns", this.selectedYValues);
      });
    }
    else if (this.selectedOption === "Bar Chart") {
      import("../../../../../assets/notebooks/notebook-barplot/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "barPlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
        this.main.redefine("yColumns", this.selectedYValues);
      });
    }
    else if (this.selectedOption === "Scatter Plot") {
      import("../../../../../assets/notebooks/notebook-scatterplot/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "scatterPlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
        this.main.redefine("yColumns", this.selectedYValues);
      });
    }
    else if (this.selectedOption === "Pie Chart") {
      import("../../../../../assets/notebooks/notebook-piechart/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "pieChartPlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
      });
    }
    else if (this.selectedOption === "Density Plot") {
      import("../../../../../assets/notebooks/notebook-densityplot/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "densityPlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
      });
    }
    else if (this.selectedOption === "3D Scatter Plot") {
      import("../../../../../assets/notebooks/notebook-3dscatterplot/index").then((define) => {
        var notebook = define.default;
        this.main = (new Runtime).module(notebook, name => {
          if (name === "threeDScatterPlot") {
            return Inspector.into("#notebook")();
          }
        });
        this.main.redefine("data", this.data);
        this.main.redefine("xColumn", this.selectedXValue);
        this.main.redefine("yColumn", this.selectedYValue);
        this.main.redefine("zColumn", this.selectedZValue);
      });
    }
    /*
    this.dataToVisualize = this.data.map(record => {
      let yData = {

      }
      this.selectedYValues.forEach(yValue => yData[yValue] = record[yValue] !== null ? record[yValue].toString() : this.returnZeroOrNull(yValue))

      let zData = {

      }
      this.selectedZValues.forEach(zValue => zData[zValue] = record[zValue] !== null ? record[zValue].toString() : this.returnZeroOrNull(zValue))
      return {
        'x': {
          [this.selectedXValue]: record[this.selectedXValue] !== null ? record[this.selectedXValue].toString() : this.returnZeroOrNull(this.selectedXValue)
        },
        'y': yData,
        'z': zData
      }
    })


    let xValues : any = {};
    let yValues : any = {};
    let zValues : any = {};
    this.dataToVisualize.forEach(rec=>{

      for(const key of Object.keys(rec['x']))
      {
        xValues[rec['x'][key]] = true;
      }
      
      for(const key of Object.keys(rec['y']))
      {
        yValues[rec['y'][key]] = true;
      }

      for(const key of Object.keys(rec['y']))
      {
        zValues[rec['z'][key]] = true;
      }

    })

    this.xRange = [];
    this.yRange = [];
    this.zRange = [];

    for(const key of Object.keys(xValues))
    {
      this.xRange.push(key);
    }

    for(const key of Object.keys(yValues))
    {
      this.yRange.push(key);
    }

    for(const key of Object.keys(zValues))
    {
      this.zRange.push(key);
    }

    this.xRange.sort(this.sortStrings);
    this.yRange.sort(this.sortStrings);
    this.zRange.sort(this.sortStrings);

    this.columnXName = this.selectedXValue;
    */

  }


}

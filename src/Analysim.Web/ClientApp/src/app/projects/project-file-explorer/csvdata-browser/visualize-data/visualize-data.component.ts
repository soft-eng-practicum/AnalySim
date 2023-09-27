import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';



@Component({
  selector: 'app-visualize-data',
  templateUrl: './visualize-data.component.html',
  styleUrls: ['./visualize-data.component.scss']
})
export class VisualizeDataComponent implements OnInit {

  options: string[] = ['Density Chart','Pie Chart','Bar Chart','Line Chart','Scatter Plot','3D Scatter Plot'];
  twoDOptions: string[] = ['Bar Chart','Line Chart','Scatter Plot'];
  threeDOptions: string[] = ['3D Scatter Plot'];
  selectedOption: string = 'Density Chart';

  @Input() cols: string[];

  selectedXValue : string;
  selectedYValue : string; 
  selectedZValue : string;
  

  @Output() closeModalEvent = new EventEmitter();

  @Input() data: any;

  dataToVisualize: [];

  @Input() columnDataTypes: any;

  
  constructor() { }


  ngOnInit(): void {
    this.selectedXValue = this.cols[0];
    this.selectedYValue = this.cols[0];
    this.selectedZValue = this.cols[0];
  }

  closeModal(){
    this.closeModalEvent.emit();
  }

  visualizeData(){
    this.dataToVisualize = this.data.map(record=>{
      return {
        'x': record[this.selectedXValue],
        'y': record[this.selectedYValue],
        'z': record[this.selectedZValue]
      }
    })
  }


}

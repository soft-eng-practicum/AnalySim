import { Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';
import * as d3 from 'd3';
import { LazyLoadEvent, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-csvdata-browser',
  templateUrl: './csvdata-browser.component.html',
  styleUrls: ['./csvdata-browser.component.scss']
})
export class CSVDataBrowserComponent implements OnInit {

  constructor(
    private modalService : BsModalService) { }

  @Input() csvFile: BlobFile;
  columnDataTypes = {};
  selectedData: any[];
  data: any[];
  Object = Object;
  totalRecords!: number;
  loadedData: any[];
  loading: boolean = true;
  cols: string[];
  @ViewChild('table') table: Table;
  @ViewChild('searchFilter') inputField: ElementRef;
  columnWidth: string;
  _selectedColumns!: any[];
  @ViewChild('visualizeDataModal') visualizeDataModal : TemplateRef<any>;
  visualizeDataModalRef : BsModalRef;
  tableData: any;
  checked: boolean;

  ngOnInit(): void {
    d3.csv(this.csvFile.uri, d3.autoType).then(res => {
      this.determinColumnTypes(res);
      this.data = res;
      this.loadedData = this.data;
      this.tableData = this.data;
      this.loading = false;
      this.checked = false;
    });
  }



  determinColumnTypes(data) {

    // Assuming the first row of the CSV contains column headers
    const headers = Object.keys(data[0]);
    this.cols = headers;
    this._selectedColumns = this.cols;
    this.columnWidth = (headers.length * 20).toString() + 'rem';
    headers.forEach((header) => {
      const columnValues = data.map((row) => row[header]);
      const isNumeric = columnValues.every((value) => !isNaN(Number(value)));

      if (isNumeric) {
        this.columnDataTypes[header]='numeric';
      } else {
        this.columnDataTypes[header] = 'text';
      }
    });

  }
  

  clear(table: Table) {
    table.clear();
    this.loadedData = this.data.slice(0);
    this.inputField.nativeElement.value = "";
  }

  applyFilterGlobal($event, stringVal) {
    this.table.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    //restore original order
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
  }

  csvmaker(data) {
  
    // Empty array for storing the values
    let csvRows = [];
  
    // Headers is basically a keys of an object
    // which is id, name, and profession
    const headers = Object.keys(data[0]);
  
    // As for making csv format, headers must
    // be separated by comma and pushing it
    // into array
    csvRows.push(headers.join(','));
  
    // Pushing Object values into array
    // with comma separation
    data.forEach(rec=>{
      const values = Object.values(rec).join(',');
      csvRows.push(values);
    })

  
    // Returning the array joining with new line 
    return csvRows.join('\n')
}

download(data) {
  
  // Creating a Blob for having a csv file format 
  // and passing the data with type
  const blob = new Blob([data], { type: 'text/csv' });

  // Creating an object for downloading url
  const url = window.URL.createObjectURL(blob)

  // Creating an anchor(a) tag of HTML
  const a = document.createElement('a')

  // Passing the blob downloading url 
  a.setAttribute('href', url)

  // Setting the anchor tag attribute for downloading
  // and passing the download file name
  a.setAttribute('download', 'download.csv');

  // Performing a download with click
  a.click()
}

  seeSelectedData() {
    if(!this.selectedData || this.selectedData.length===0)
    {
      this.createData(this.tableData);
    }
    else {
      this.createData(this.selectedData);
    }
  }

  createData(data) {
    let newData = [];
    data.forEach(rec => {
      let newRecord = {

      }
      this.table._columns.forEach(column => {
        newRecord[column] = rec[column];
      })
      newData.push(newRecord);
    })
    const csvdata = this.csvmaker(newData);
    this.download(csvdata);
  }

  toggleModalVisualizeData(){
    // Show Upload Modal
    this.visualizeDataModalRef = this.modalService.show(this.visualizeDataModal);
  }

  closeModalVisualizeData(){
    // Show Upload Modal
    this.visualizeDataModalRef.hide();
  }


  resetSelectedData(event){
    setTimeout(()=>{
      this.selectedData=[];
    },1);
    if(event.filteredValue!==undefined)
    {
      this.tableData = event.filteredValue;
      console.log(this.tableData);
    }
  }

  onCheckboxClick(value){
    if(this.checked)
    {
        this.selectedData = this.tableData;
    }
    else{
      this.selectedData = [];
    }

  }

}

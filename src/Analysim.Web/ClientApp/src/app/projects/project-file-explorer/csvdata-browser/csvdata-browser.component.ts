import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';
import * as d3 from 'd3';
import { LazyLoadEvent, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';


@Component({
  selector: 'app-csvdata-browser',
  templateUrl: './csvdata-browser.component.html',
  styleUrls: ['./csvdata-browser.component.scss']
})
export class CSVDataBrowserComponent implements OnInit {

  constructor() { }

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

  ngOnInit(): void {
    d3.csv(this.csvFile.uri, d3.autoType).then(res => {
      this.determinColumnTypes(res);
      this.data = res;
      this.loadedData = this.data;
      this.loading = false;

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

  loadData(event: LazyLoadEvent) {
    this.loading = true;
    console.log(event);
    setTimeout(() => {
      const filteredData = [ ...this.data ];
      if (event.sortField) {
        filteredData.sort((a, b) => {
          if (event.sortOrder === 1) {
            return a[event.sortField] - b[event.sortField];
          }
          else {
            return b[event.sortField] - a[event.sortField];
          }
        })
      }
      this.loadedData = filteredData.slice(event.first, event.first + event.rows);
      this.totalRecords = this.data.length;
      this.loading = false;
      },1000);
  }

  clear(table: Table) {
    console.log(table);
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

  seeSelectedData() {
    console.log(this.selectedData);
  }



}

import { Component, Input, OnInit } from '@angular/core';
import { BlobFile } from 'src/app/interfaces/blob-file';
import * as d3 from 'd3';
import { LazyLoadEvent, SortEvent } from 'primeng/api';


@Component({
  selector: 'app-csvdata-browser',
  templateUrl: './csvdata-browser.component.html',
  styleUrls: ['./csvdata-browser.component.scss']
})
export class CSVDataBrowserComponent implements OnInit {

  constructor() { }

  @Input() csvFile: BlobFile;
  columnDataTypes = [];
  data: any[];
  Object = Object;
  totalRecords!: number;
  loadedData: any[];
  loading: boolean = false;

  ngOnInit(): void {
    d3.csv(this.csvFile.uri, d3.autoType).then(res => {
      this.determinColumnTypes(res);
      this.data = res;
      console.log(this.data);
    });
  }



  determinColumnTypes(data) {

    // Assuming the first row of the CSV contains column headers
    const headers = Object.keys(data[0]);

    headers.forEach((header) => {
      const columnValues = data.map((row) => row[header]);
      const isNumeric = columnValues.every((value) => !isNaN(Number(value)));

      if (isNumeric) {
        this.columnDataTypes.push([header,'number']);
      } else {
        this.columnDataTypes.push([header, 'string']);
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



}

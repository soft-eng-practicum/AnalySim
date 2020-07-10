import { Component, OnInit } from '@angular/core';
import { StringifyOptions } from 'querystring';
import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.css']
})

export class FileViewerComponent implements OnInit {

  csvContent: string[][] = [];
  // csvSeparator: string = ",";
  public header: string[] = [];
  public data: string[][] = [];;
  constructor() { }

  ngOnInit() {
   }

  generateHeaderHtml() {
    let headers: string[] = [];

    for (const column of this.csvContent[0]) {
      headers.push(column);
    }

    return headers;
  }

  generateTableHtml() {
    let data: string[][] = [];

    for (const row of this.csvContent.slice(1)) {
      let dataRow: string[] = []
      
      for (const column of row) {
        dataRow.push(column);
      }
      
      if(!(dataRow[0] == "" && dataRow.length == 1))
      {
        data.push(dataRow);
      }
      
    }

    return data;
  }

  onFileLoad(fileLoadedEvent) {
    const csv: string = fileLoadedEvent.target.result;
    const textsFromFile: string[] = csv.split(/\r|\n|\r/);
    
    for (const text of textsFromFile) {
      if (this.csvContent === undefined) {
        this.csvContent = [];
      }
      
      this.csvContent.push(text.split(","));
    }
    
    this.header = this.generateHeaderHtml();
    this.data = this.generateTableHtml();
    
    // Kept saying the function was not a function so its time to hack this shit.
    // this.header = this.csvContent[0].map(column => {
    //   return `<th> ${column} </th>`;
    // });
    // this.data =this.csvContent.slice(1).map(row => {
    //   let rowData: string = "<tr>\n\t";

    //   row.forEach(column => {
    //     rowData += `<td> <span> ${column} </span> </td>\n`;
    //   });

    //   rowData += "</tr>"

    //   return rowData;
    // }).join("");
    
  }

  onFileSelect(input: any) {
    const files = input.target.files;
    
    const fileToRead = files[0];
    const fileReader: FileReader = new FileReader();
    fileReader.readAsText(new Blob([fileToRead]));
    fileReader.onload = this.onFileLoad.bind(this);
  }
}
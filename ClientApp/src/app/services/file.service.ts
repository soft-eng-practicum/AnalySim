import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // Url to access Web API
  private baseUrlUpload : string = "/api/account/login";

  constructor(private http: HttpClient) { }

  upload(file: any){
    let input = new FormData();
    input.append("filesData", file);
    return this.http.post<any>(this.baseUrlUpload, {input}).pipe(
      map(result => {
        return result;
      },
      error =>{
        return error;
      })
    );
  }
}

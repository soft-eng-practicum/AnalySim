import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // Url to access Web API
  private baseUrlUpload : string = "/api/blobstorage/upload";
  private baseUrlDelete : string = "/api/blobstorage/delete";
  private baseUrlMove : string = "/api/blobstorage/move";
  private baseUrlDownload : string = "/api/blobstorage/download";
  private baseUrlLogin : string = "/api/account/login";

  constructor(private http: HttpClient) { }

  upload(file: any, containerName: string, directory: string){
    let body = new FormData()
    body.append('file', file)
    body.append('container', containerName)
    body.append('directory', directory)

    return this.http.post<any>(this.baseUrlUpload, body).pipe(
      map(result => {
        console.log('Result:' + result)
        return result
      },
      error =>{
        console.log('Error:' + error)
        return error
      })
    );
  }

  delete(containerName: string, directory: string){
    return this.http.delete<any>(this.baseUrlDelete + '/' + containerName + '/' + directory).pipe(
      map(result => {
        console.log('Result:' + result)
        return result
      },
      error =>{
        console.log('Error:' + error)
        return error
      })
    );
  }

}

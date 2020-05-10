import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // Url to access Web API
  private baseUrl : string = '/api/blobstorage/'

  // Post
  private urlUpload : string = this.baseUrl + "upload"

  // Delete
  private urlDelete : string = this.baseUrl + "delete/"

  constructor(private http: HttpClient) { }

  upload(file: any, containerName: string, directory: string){
    let body = new FormData()
    body.append('file', file)
    body.append('container', containerName)
    body.append('directory', directory)

    return this.http.post<any>(this.urlUpload, body).pipe(
      map(result => {
        console.log(result.message)
        return result.object
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

  delete(containerName: string, directory: string){
    return this.http.delete<any>(this.urlDelete + containerName + '/' + directory).pipe(
      map(result => {
        console.log(result.message)
        return result.object
      },
      error =>{
        console.log(error)
        return error
      })
    );
  }

}

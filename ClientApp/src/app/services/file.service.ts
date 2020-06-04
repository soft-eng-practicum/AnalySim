import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { BlobFile } from '../interfaces/blob-file';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // Url to access Web API
  private baseUrl : string = '/api/blobstorage/'

  // Post
  private urlUpload : string = this.baseUrl + "upload"
  private urlUploadProfileImage : string = this.baseUrl + "uploadprofileimage"

  // Delete
  private urlDelete : string = this.baseUrl + "delete/"

  constructor(private http: HttpClient) { }

  upload(file: any, containerName: string, directory: string) : Observable<BlobFile>{
    let body = new FormData()
    body.append('file', file)
    body.append('container', containerName)
    body.append('directory', directory)

    return this.http.post<any>(this.urlUpload, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  uploadProfileImage(file: any, userID: number) : Observable<BlobFile>{
    let body = new FormData()
    body.append('file', file)
    body.append('userID', userID.toString())

    return this.http.post<any>(this.urlUploadProfileImage, body).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  delete(fileID : number){
    return this.http.delete<any>(this.urlDelete + fileID).pipe(
      map(result => {
        console.log(result.message)
        return result.resultObject
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

}

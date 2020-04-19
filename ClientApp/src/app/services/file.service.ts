import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  // Url to access Web API
  private baseUrlUploadFile : string = "/api/blobstorage/uploadfile";
  private baseUrlDeleteFile : string = "/api/blobstorage/deletefile";
  private baseUrlTransferFile : string = "/api/blobstorage/transferfile";
  private baseUrlDownloadFile : string = "/api/blobstorage/downloadfile";
  private baseUrlLogin : string = "/api/account/login";

  constructor(private http: HttpClient) { }

  upload(file: any, containerName: string, directory: string)
  {
    let body = new FormData();
    body.append('blob', file);
    body.append('container', containerName);
    body.append('directory', directory);

    return this.http.post<any>(this.baseUrlUploadFile, body).pipe(
      map(result => {
        console.log('Result:' + result);
        return result;
      },
      error =>{
        console.log('Error:' + error);
        return error;
      })
    );

    


  }
}

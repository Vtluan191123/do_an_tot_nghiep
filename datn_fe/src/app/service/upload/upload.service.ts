import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = '/api/upload';

  constructor(private http: HttpClient) { }

  /**
   * Upload files to server
   */
  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post(this.apiUrl, formData);
  }

  /**
   * Upload single file
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post(this.apiUrl, formData);
  }

  /**
   * Delete files from server
   */
  deleteFiles(fileNames: string[]): Observable<any> {
    return this.http.delete(this.apiUrl + '/delete', {
      params: {
        files: fileNames
      }
    });
  }
}


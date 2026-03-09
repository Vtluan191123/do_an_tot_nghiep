import { Injectable } from '@angular/core';
import {TransferDataService} from '../tranfer-data/transfer-data.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private transferDataService:TransferDataService) { }

  getInfoUser(){

  }
}

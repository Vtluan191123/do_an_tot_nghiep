import { TestBed } from '@angular/core/testing';

import { TransferDataService } from './transfer-data.service';

describe('TranferDataService', () => {
  let service: TransferDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

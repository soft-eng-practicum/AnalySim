import { TestBed } from '@angular/core/testing';

import { CommunicationsService } from './communications.service';

describe('CommunicationsService', () => {
  let service: CommunicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

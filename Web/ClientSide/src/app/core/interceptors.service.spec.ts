import { TestBed } from '@angular/core/testing';

import { InterceptorsService } from './interceptors.service';

describe('InterceptorsService', () => {
  let service: InterceptorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterceptorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

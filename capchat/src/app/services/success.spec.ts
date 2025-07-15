import { TestBed } from '@angular/core/testing';

import { Success } from './success';

describe('Success', () => {
  let service: Success;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Success);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

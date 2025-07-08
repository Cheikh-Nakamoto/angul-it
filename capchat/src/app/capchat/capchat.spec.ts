import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Capchat } from './capchat';

describe('Capchat', () => {
  let component: Capchat;
  let fixture: ComponentFixture<Capchat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Capchat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Capchat);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

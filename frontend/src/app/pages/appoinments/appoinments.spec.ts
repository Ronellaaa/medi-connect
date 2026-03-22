import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Appoinments } from './appoinments';

describe('Appoinments', () => {
  let component: Appoinments;
  let fixture: ComponentFixture<Appoinments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Appoinments],
    }).compileComponents();

    fixture = TestBed.createComponent(Appoinments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

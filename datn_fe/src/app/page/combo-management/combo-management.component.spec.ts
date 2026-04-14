import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboManagementComponent } from './combo-management.component';

describe('ComboManagementComponent', () => {
  let component: ComboManagementComponent;
  let fixture: ComponentFixture<ComboManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ComboManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComboManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


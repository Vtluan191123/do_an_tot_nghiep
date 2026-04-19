import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEnrolledSubjectsComponent } from './student-enrolled-subjects.component';

describe('StudentEnrolledSubjectsComponent', () => {
  let component: StudentEnrolledSubjectsComponent;
  let fixture: ComponentFixture<StudentEnrolledSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ StudentEnrolledSubjectsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentEnrolledSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


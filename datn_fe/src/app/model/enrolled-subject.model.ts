export interface EnrolledSubject {
  userSubjectId: number;
  subjectId: number;
  subjectName: string;
  total: number;  // Tổng số buổi
  remaining: number;  // Số buổi còn lại
  enrollmentDate: string;
}


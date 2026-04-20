export interface BookingCreateRequest {
  userId: number;
  subjectId: number;
  timeSlotId: number;
  status?: number; // 0 = Chưa xác nhận, 1 = Đã xác nhận, 2 = Đã hoàn thành, 3 = Đã hủy
}

export interface Booking extends BookingCreateRequest {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingFilterRequest {
  userId?: number;
  subjectId?: number;
  status?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}


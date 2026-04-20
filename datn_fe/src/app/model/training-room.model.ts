export interface TrainingRoom {
  id?: number;
  timeSlotsSubjectId: number;
  coachId: number;
  coachName?: string;  // Tên huấn luyện viên
  subjectId: number;
  subjectName?: string;  // Tên bộ môn
  name: string;
  description?: string;
  maxCapacity: number;      // Sức chứa tối đa
  currentCapacity: number;  // Số học viên đã đăng ký
  trainingMethods?: string;  // Online or Offline
  date?: string;  // Ngày (YYYY-MM-DD)
  startTime?: string;  // Giờ bắt đầu (ISO 8601)
  endTime?: string;  // Giờ kết thúc (ISO 8601)
  zoomLink?: string;
  status: string;  // ACTIVE, INACTIVE
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingRoomCreateRequest {
  timeSlotsSubjectId: number;
  coachId: number;
  subjectId: number;
  name: string;
  description?: string;
  capacity: number;
  zoomLink?: string;
  status?: string;
}

export interface TrainingRoomUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  capacity?: number;
  zoomLink?: string;
  status?: string;
  currentParticipants?: number;
}

export interface TrainingRoomFilterRequest {
  coachId?: number;
  subjectId?: number;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}


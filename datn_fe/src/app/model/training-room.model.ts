export interface TrainingRoom {
  id?: number;
  timeSlotsSubjectId: number;
  coachId: number;
  subjectId: number;
  name: string;
  description?: string;
  capacity: number;
  zoomLink?: string;
  status: string;  // ACTIVE, INACTIVE
  currentParticipants?: number;
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


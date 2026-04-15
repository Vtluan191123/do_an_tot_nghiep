export interface Subject {
  id?: number;
  name: string;
  description?: string;
  images?: string;
  status: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
  creator?: number;
  updater?: number;
}

export interface SubjectFilterRequest {
  id?: number;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface SubjectCreateRequest {
  name: string;
  description?: string;
  images?: string;
  status: string;
  price: number;
}

export interface SubjectUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  images?: string;
  status?: string;
  price?: number;
}

export interface SubjectUpdateRequest extends SubjectCreateRequest {
  id: number;
}


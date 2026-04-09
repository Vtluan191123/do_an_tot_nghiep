export interface Combo {
  id: number;
  code: string;
  name: string;
  description: string;
  prices: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComboFilterRequest {
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
  keyword?: string;
  code?: string;
  id?: number;
}


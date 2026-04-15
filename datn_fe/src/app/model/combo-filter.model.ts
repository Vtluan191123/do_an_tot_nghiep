// combo-filter.model.ts - Thêm vào model combo của frontend

import {ComboFilterRequest} from './combo.model';

export interface ComboSubjectDropdown {
  id: number;
  name: string;
  description: string;
}

export interface ComboFilterRequestWithSubject extends ComboFilterRequest {
  subjectId?: number;
  subjectName?: string;
}


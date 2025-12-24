
import { ResultStatus } from './types';

export const SHEET_ID = '1UUPQAt7sRay4XhGTiacPKpL0jRxwCs9oUP2PB6HnVvI';
export const SHEET_NAME = '2023~';
export const DATA_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?&sheet=${encodeURIComponent(SHEET_NAME)}&tq=select%20*`;

export const RESULT_COLORS = {
  [ResultStatus.SUCCESS]: '#10b981', // green-500
  [ResultStatus.WAITLIST]: '#3b82f6', // blue-500
  [ResultStatus.FAIL]: '#ef4444',    // red-500
  [ResultStatus.UNKNOWN]: '#94a3b8' // slate-400
};

export const COLUMN_MAPPING = {
  YEAR: 0,       // 학년도
  NAME: 1,       // 이름
  UNIVERSITY: 2, // 대학명
  DEPARTMENT: 3, // 모집단위
  TYPE: 4,       // 전형유형
  GPA: 5,        // 내신
  RESULT: 6      // 결과
};

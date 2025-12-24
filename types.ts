
export interface AdmissionRecord {
  id: string;
  year: string;        // 학년도 (A)
  studentName: string; // 이름 (B)
  university: string;  // 대학명 (C)
  department: string;  // 모집단위 (D)
  admissionType: string; // 전형유형 (E)
  gpa: string;         // 내신 (F)
  result: ResultStatus; // 결과 (G)
}

export enum ResultStatus {
  SUCCESS = '합격',
  WAITLIST = '충원합격',
  FAIL = '불합격',
  UNKNOWN = '미입력'
}

export interface DashboardStats {
  total: number;
  successTotal: number;
  initialSuccess: number;
  waitlistSuccess: number;
  failure: number;
  successRate: number;
}

export interface ChartData {
  name: string;
  [ResultStatus.FAIL]: number;
  [ResultStatus.SUCCESS]: number;
  [ResultStatus.WAITLIST]: number;
}

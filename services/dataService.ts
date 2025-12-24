
import { DATA_URL, COLUMN_MAPPING } from '../constants';
import { AdmissionRecord, ResultStatus } from '../types';

export const fetchAdmissionData = async (): Promise<AdmissionRecord[]> => {
  try {
    const response = await fetch(DATA_URL);
    const text = await response.text();
    
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const json = JSON.parse(jsonString);
    
    const rows = json.table.rows;
    return rows.map((row: any, index: number) => {
      const getVal = (colIdx: number) => row.c[colIdx]?.v ?? '';
      
      const rawResult = String(getVal(COLUMN_MAPPING.RESULT)).trim();
      let status: ResultStatus = ResultStatus.UNKNOWN;
      
      if (rawResult === '합격') status = ResultStatus.SUCCESS;
      else if (rawResult === '충원합격') status = ResultStatus.WAITLIST;
      else if (rawResult === '불합격') status = ResultStatus.FAIL;

      return {
        id: `row-${index}`,
        year: String(getVal(COLUMN_MAPPING.YEAR)),
        studentName: String(getVal(COLUMN_MAPPING.NAME)),
        university: String(getVal(COLUMN_MAPPING.UNIVERSITY)),
        department: String(getVal(COLUMN_MAPPING.DEPARTMENT)),
        admissionType: String(getVal(COLUMN_MAPPING.TYPE)),
        gpa: String(getVal(COLUMN_MAPPING.GPA)),
        result: status
      };
    }).filter((record: AdmissionRecord) => record.studentName !== '' && record.year !== '학년도'); 
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

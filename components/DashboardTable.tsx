
import React from 'react';
import { AdmissionRecord, ResultStatus } from '../types';
import { RESULT_COLORS } from '../constants';

interface DashboardTableProps {
  records: AdmissionRecord[];
}

const DashboardTable: React.FC<DashboardTableProps> = ({ records }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          <tr>
            <th className="px-4 py-2">학생 정보</th>
            <th className="px-4 py-2">대학 / 모집단위</th>
            <th className="px-4 py-2">전형 유형</th>
            <th className="px-4 py-2 text-center">내신</th>
            <th className="px-4 py-2 text-right">결과</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {records.map((record) => (
            <tr key={record.id} className="bg-white hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-4 rounded-l-xl">
                <div className="font-semibold text-slate-800">{record.studentName}</div>
                <div className="text-slate-400 text-xs">{record.year}학년도</div>
              </td>
              <td className="px-4 py-4">
                <div className="font-medium text-slate-700">{record.university}</div>
                <div className="text-slate-500 text-xs">{record.department}</div>
              </td>
              <td className="px-4 py-4">
                <div className="text-slate-700 text-xs bg-slate-100 px-2 py-1 rounded inline-block font-medium">
                  {record.admissionType}
                </div>
              </td>
              <td className="px-4 py-4 text-center font-mono text-blue-600 font-bold">
                {record.gpa}
              </td>
              <td className="px-4 py-4 text-right rounded-r-xl">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold inline-block"
                  style={{ 
                    backgroundColor: `${RESULT_COLORS[record.result]}15`, 
                    color: RESULT_COLORS[record.result] 
                  }}
                >
                  {record.result}
                </span>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-20 text-slate-400 bg-white rounded-xl">
                검색 조건과 일치하는 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;

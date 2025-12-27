
import React from 'react';
import { AdmissionRecord, ResultStatus } from '../types';
import { RESULT_COLORS } from '../constants';

interface DashboardTableProps {
  records: AdmissionRecord[];
}

const DashboardTable: React.FC<DashboardTableProps> = ({ records }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
          <tr>
            <th className="px-6 py-2">지원 학생</th>
            <th className="px-6 py-2">지원 정보 (대학/전형/학과)</th>
            <th className="px-6 py-2 text-center">내신</th>
            <th className="px-6 py-2 text-right">최종 결과</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {records.map((record) => (
            <tr key={record.id} className="bg-white hover:bg-slate-50 transition-all group shadow-sm border border-slate-100">
              {/* 학생 정보 */}
              <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50">
                <div className="font-bold text-slate-700">{record.studentName}</div>
                <div className="text-slate-400 text-xs mt-0.5">{record.year}학년도</div>
              </td>

              {/* 지원 정보 */}
              <td className="px-6 py-5 border-y border-slate-50">
                <div className="font-bold text-slate-800 text-base">{record.university}</div>
                <div className="text-slate-500 text-xs mt-1">
                  <span className="font-medium">{record.admissionType}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-400">{record.department}</span>
                </div>
              </td>

              {/* 내신 */}
              <td className="px-6 py-5 text-center border-y border-slate-50">
                <div className="text-blue-600 font-bold text-lg">
                  {record.gpa}
                </div>
              </td>

              {/* 결과 */}
              <td className="px-6 py-5 text-right rounded-r-2xl border-y border-r border-slate-50">
                <span 
                  className="px-4 py-1.5 rounded-full text-xs font-bold inline-block"
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
              <td colSpan={4} className="text-center py-20 text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200">
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardTable;

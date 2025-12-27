
import React, { useMemo } from 'react';
import { AdmissionRecord, ResultStatus } from '../types';
import { BarChart2 } from 'lucide-react';

interface GradeDistributionAnalysisProps {
  data: AdmissionRecord[];
}

const GradeDistributionAnalysis: React.FC<GradeDistributionAnalysisProps> = ({ data }) => {
  const distribution = useMemo(() => {
    const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    return grades.map(grade => {
      const gradeData = data.filter(r => {
        const gpa = parseFloat(r.gpa);
        return !isNaN(gpa) && Math.floor(gpa) === grade;
      });

      const total = gradeData.length;
      const success = gradeData.filter(r => r.result === ResultStatus.SUCCESS).length;
      const waitlist = gradeData.filter(r => r.result === ResultStatus.WAITLIST).length;
      const fail = gradeData.filter(r => r.result === ResultStatus.FAIL).length;
      const passRate = total > 0 ? ((success + waitlist) / total) * 100 : 0;

      return {
        grade: `${grade}등급대`,
        total,
        success,
        waitlist,
        fail,
        passRate
      };
    }).filter(d => d.total > 0 || parseInt(d.grade) <= 6); // 6등급 이하는 데이터 없어도 보여주거나, 데이터 있는 것만 보여줌 (이미지 참고)
  }, [data]);

  // 등급별 분석용 최대 건수 계산
  const maxGradeTotal = useMemo(() => {
    return Math.max(...distribution.map(d => d.total), 1);
  }, [distribution]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-extrabold text-slate-800">내신 등급별 분포</h2>
        <div className="bg-indigo-50 p-2 rounded-2xl text-indigo-600">
          <BarChart2 size={24} />
        </div>
      </div>
      <p className="text-slate-400 text-[11px] font-black mb-8 tracking-widest uppercase">Pass Rate by Grade</p>

      <div className="space-y-8">
        {distribution.map((item) => (
          <div key={item.grade} className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black">
                {item.grade}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Pass Rate</span>
                <span className="text-lg font-black text-[#4f46e5]">
                  {item.passRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Outer container for relative width based on total count */}
            <div style={{ width: `${(item.total / maxGradeTotal) * 100}%` }} className="transition-all duration-500 min-w-[20px]">
              {/* Stacked Bar Chart */}
              <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                <div 
                  className="h-full bg-[#10b981] transition-all duration-500" 
                  style={{ width: item.total > 0 ? `${(item.success / item.total) * 100}%` : '0%' }} 
                />
                <div 
                  className="h-full bg-[#60a5fa] transition-all duration-500" 
                  style={{ width: item.total > 0 ? `${(item.waitlist / item.total) * 100}%` : '0%' }} 
                />
                <div 
                  className="h-full bg-[#fb7185] transition-all duration-500" 
                  style={{ width: item.total > 0 ? `${(item.fail / item.total) * 100}%` : '0%' }} 
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> {item.success}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]" /> {item.waitlist}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fb7185]" /> {item.fail}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-300">총 {item.total}건</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradeDistributionAnalysis;

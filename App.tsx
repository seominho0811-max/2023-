
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCcw,
  Calendar,
  Lock,
  User,
  LogIn,
  Info,
  ChevronDown,
  School,
  BookOpen
} from 'lucide-react';
import { fetchAdmissionData } from './services/dataService';
import { AdmissionRecord, ResultStatus, DashboardStats } from './types';
import { RESULT_COLORS } from './constants';
import StatCard from './components/StatCard';
import DashboardTable from './components/DashboardTable';
import GradeDistributionAnalysis from './components/GradeDistributionAnalysis';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [data, setData] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 검색 상태 분리: 대학명 검색과 학과/이름 검색
  const [uniSearch, setUniSearch] = useState('');
  const [deptNameSearch, setDeptNameSearch] = useState('');
  
  const [yearFilter, setYearFilter] = useState('전체');
  
  // 내신 범위 필터 상태
  const [minGpa, setMinGpa] = useState<number>(1);
  const [maxGpa, setMaxGpa] = useState<number>(9);

  const fetchData = async () => {
    setLoading(true);
    const result = await fetchAdmissionData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map(d => d.year))).filter(Boolean) as string[];
    return ['전체', ...uniqueYears.sort((a, b) => Number(b) - Number(a))];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(record => {
      // 대학명 조건 (AND)
      const uniLower = uniSearch.toLowerCase();
      const matchesUni = record.university.toLowerCase().includes(uniLower);
      
      // 학과/이름 조건 (AND)
      const deptNameLower = deptNameSearch.toLowerCase();
      const matchesDeptName = 
        record.studentName.toLowerCase().includes(deptNameLower) ||
        record.department.toLowerCase().includes(deptNameLower);
      
      // 학년도 조건
      const matchesYear = yearFilter === '전체' || record.year === yearFilter;

      // 내신 조건
      const gpaNum = parseFloat(record.gpa);
      const gpaGrade = Math.floor(gpaNum);
      const matchesGpa = isNaN(gpaNum) || (gpaGrade >= minGpa && gpaGrade <= maxGpa);
      
      return matchesUni && matchesDeptName && matchesYear && matchesGpa;
    });
  }, [data, uniSearch, deptNameSearch, yearFilter, minGpa, maxGpa]);

  const stats: DashboardStats = useMemo(() => {
    const total = filteredData.length;
    const initialSuccess = filteredData.filter(r => r.result === ResultStatus.SUCCESS).length;
    const waitlistSuccess = filteredData.filter(r => r.result === ResultStatus.WAITLIST).length;
    const failure = filteredData.filter(r => r.result === ResultStatus.FAIL).length;
    const successTotal = initialSuccess + waitlistSuccess;
    const successRate = total > 0 ? (successTotal / total) * 100 : 0;

    return { total, successTotal, initialSuccess, waitlistSuccess, failure, successRate };
  }, [filteredData]);

  const typeAnalysisData = useMemo(() => {
    const categories = [
      { id: 'gyogwa', label: '학생부 교과', match: '교과', color: '#10b981' },
      { id: 'jonghab', label: '학생부 종합', match: '종합', color: '#3b82f6' },
      { id: 'silgi', label: '실기/실적', match: '실기', color: '#a855f7' },
      { id: 'nonsul', label: '논술 위주', match: '논술', color: '#f59e0b' }
    ];
    
    return categories.map(cat => {
      const typeData = filteredData.filter(r => r.admissionType.includes(cat.match));
      const total = typeData.length;
      const success = typeData.filter(r => r.result === ResultStatus.SUCCESS).length;
      const waitlist = typeData.filter(r => r.result === ResultStatus.WAITLIST).length;
      const fail = typeData.filter(r => r.result === ResultStatus.FAIL).length;
      const rate = total > 0 ? ((success + waitlist) / total) * 100 : 0;

      return {
        ...cat,
        total,
        success,
        waitlist,
        fail,
        rate
      };
    }).filter(d => d.total > 0);
  }, [filteredData]);

  // 전형별 분석용 최대 건수 계산
  const maxTypeTotal = useMemo(() => {
    return Math.max(...typeAnalysisData.map(d => d.total), 1);
  }, [typeAnalysisData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ed2267ne' && username.trim() !== '') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('비밀번호가 틀렸거나 이름을 확인해주세요.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-lg mb-4">
              <TrendingUp size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">대입 수시모집 결과 조회</h1>
            <p className="text-slate-500 text-sm">입시 데이터 열람을 위해 로그인하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="이름"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="비밀번호"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
                <XCircle size={14} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              입시 결과 조회하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-blue-600 w-10 h-10" />
          <p className="text-slate-500 font-medium">데이터를 분석 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">대입 수시 결과 대시보드</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">대학별, 전형별 합격 데이터를 실시간 분석합니다.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          {/* Custom Grade Range Selector */}
          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-full px-8 py-3 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mr-1">GRADE</span>
            
            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-1">
                <select 
                  className="appearance-none bg-transparent text-lg font-bold text-slate-700 pr-5 focus:outline-none cursor-pointer"
                  value={minGpa}
                  onChange={(e) => setMinGpa(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n}.0</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>

              <span className="text-slate-300 font-medium text-lg">~</span>

              <div className="relative flex items-center gap-1">
                <select 
                  className="appearance-none bg-transparent text-lg font-bold text-slate-700 pr-5 focus:outline-none cursor-pointer"
                  value={maxGpa}
                  onChange={(e) => setMaxGpa(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n}.0</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search Bar 1: 대학명 */}
          <div className="relative flex-grow md:w-64 shadow-sm rounded-full bg-white border border-slate-100 overflow-hidden">
            <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="대학명 검색..."
              className="w-full pl-14 pr-6 py-3 bg-transparent focus:outline-none text-[14px] placeholder:text-slate-400"
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
            />
          </div>

          {/* Search Bar 2: 학과 또는 이름 */}
          <div className="relative flex-grow md:w-64 shadow-sm rounded-full bg-white border border-slate-100 overflow-hidden">
            <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="학과 또는 이름..."
              className="w-full pl-14 pr-6 py-3 bg-transparent focus:outline-none text-[14px] placeholder:text-slate-400"
              value={deptNameSearch}
              onChange={(e) => setDeptNameSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={fetchData}
            className="p-3.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-300 transition-all shadow-sm flex-shrink-0"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          subtitle="검색 결과 지원 건수"
          title="전체 지원 데이터"
          value={`${stats.total}건`}
          icon={<Users size={24} />}
          iconBg="bg-indigo-600"
        />
        <StatCard 
          subtitle="합격 건수"
          title={`최초합: ${stats.initialSuccess} / 충원합: ${stats.waitlistSuccess}`}
          value={`${stats.successTotal}건`}
          icon={<CheckCircle size={24} />}
          iconBg="bg-emerald-500"
        />
        <StatCard 
          subtitle="불합격 건수"
          title="해당 조건 내 불합격"
          value={`${stats.failure}건`}
          icon={<XCircle size={24} />}
          iconBg="bg-rose-500"
        />
        <StatCard 
          subtitle="검색 조건 합격률"
          title="조건별 합격 비중"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={<TrendingUp size={24} />}
          iconBg="bg-orange-500"
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8 flex flex-col">
          {/* Custom Type Analysis Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-slate-800">전형별 정밀 분석</h2>
              <div className="bg-indigo-50 p-2 rounded-2xl text-indigo-600">
                <TrendingUp size={24} />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-10 tracking-wide">Admission Type Performance</p>
            
            <div className="space-y-10">
              {typeAnalysisData.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-lg font-bold text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-slate-400">합격률</span>
                      <span className="text-xl font-black text-blue-600">{item.rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Outer container for relative width based on total count */}
                  <div style={{ width: `${(item.total / maxTypeTotal) * 100}%` }} className="transition-all duration-500 min-w-[20px]">
                    <div className="h-3 w-full bg-slate-50 rounded-full flex overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(item.success / item.total) * 100}%` }} 
                      />
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${(item.waitlist / item.total) * 100}%` }} 
                      />
                      <div 
                        className="h-full bg-rose-400 transition-all duration-500" 
                        style={{ width: `${(item.fail / item.total) * 100}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <div className="flex gap-4">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 합 {item.success}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 충 {item.waitlist}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 불 {item.fail}
                      </span>
                    </div>
                    <span className="text-slate-500">총 {item.total}건</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-50/80 p-6 rounded-[2.5rem] border border-slate-100 flex gap-4">
              <div className="p-2.5 bg-indigo-50 rounded-2xl h-fit">
                <Info size={20} className="text-indigo-500" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-700">분석 리포트 가이드</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                  스택 바의 <span className="text-emerald-500 font-bold">초록</span>은 최초 합격, <span className="text-blue-500 font-bold">파랑</span>은 충원 합격, <span className="text-rose-400 font-bold">빨강</span>은 불합격을 의미합니다. 막대의 전체 길이는 지원 건수에 비례합니다.
                </p>
              </div>
            </div>
          </div>

          {/* New Grade Distribution Section */}
          <GradeDistributionAnalysis data={filteredData} />
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[700px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-slate-800">
              <Calendar className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold">상세 지원 데이터 현황</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">학년도 필터</span>
              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                {years.map(y => <option key={y} value={y}>{y}{y !== '전체' ? '학년도' : ''}</option>)}
              </select>
            </div>
          </div>

          <DashboardTable records={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default App;

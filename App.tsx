
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCcw,
  Sparkles,
  Calendar,
  Lock,
  User,
  LogIn
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchAdmissionData } from './services/dataService';
import { getAdmissionInsights } from './services/geminiService';
import { AdmissionRecord, ResultStatus, DashboardStats, ChartData } from './types';
import { RESULT_COLORS } from './constants';
import StatCard from './components/StatCard';
import DashboardTable from './components/DashboardTable';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [data, setData] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('전체');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

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
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        record.studentName.toLowerCase().includes(searchLower) ||
        record.university.toLowerCase().includes(searchLower) ||
        record.department.toLowerCase().includes(searchLower);
      
      const matchesYear = yearFilter === '전체' || record.year === yearFilter;
      
      return matchesSearch && matchesYear;
    });
  }, [data, searchQuery, yearFilter]);

  const stats: DashboardStats = useMemo(() => {
    const total = filteredData.length;
    const initialSuccess = filteredData.filter(r => r.result === ResultStatus.SUCCESS).length;
    const waitlistSuccess = filteredData.filter(r => r.result === ResultStatus.WAITLIST).length;
    const failure = filteredData.filter(r => r.result === ResultStatus.FAIL).length;
    const successTotal = initialSuccess + waitlistSuccess;
    const successRate = total > 0 ? (successTotal / total) * 100 : 0;

    return { total, successTotal, initialSuccess, waitlistSuccess, failure, successRate };
  }, [filteredData]);

  const chartData: ChartData[] = useMemo(() => {
    const categories = ['교과', '종합', '실기', '논술'];
    
    return categories.map(cat => {
      const typeData = filteredData.filter(r => r.admissionType.includes(cat));
      
      return {
        name: cat,
        [ResultStatus.FAIL]: typeData.filter(r => r.result === ResultStatus.FAIL).length,
        [ResultStatus.WAITLIST]: typeData.filter(r => r.result === ResultStatus.WAITLIST).length,
        [ResultStatus.SUCCESS]: typeData.filter(r => r.result === ResultStatus.SUCCESS).length,
      };
    }).filter(d => (d[ResultStatus.FAIL] + d[ResultStatus.WAITLIST] + d[ResultStatus.SUCCESS]) > 0);
  }, [filteredData]);

  const handleAskAI = async () => {
    setAnalyzing(true);
    const insight = await getAdmissionInsights(filteredData);
    setAiInsight(insight);
    setAnalyzing(false);
  };

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">대입 수시 결과 대시보드</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">대학별, 전형별 합격 데이터를 실시간 분석합니다.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-grow md:w-80 shadow-sm rounded-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="대학, 학과, 이름 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
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
          {/* Chart Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Filter className="text-blue-500" size={18} />
                <h2 className="text-lg font-bold text-slate-800">전형유형별 분포 (교과·종합·실기)</h2>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="center" 
                    iconType="rect" 
                    wrapperStyle={{ paddingBottom: '30px' }} 
                  />
                  <Bar dataKey={ResultStatus.SUCCESS} stackId="a" fill={RESULT_COLORS[ResultStatus.SUCCESS]} radius={[0, 0, 0, 0]} name="최초합격" />
                  <Bar dataKey={ResultStatus.WAITLIST} stackId="a" fill={RESULT_COLORS[ResultStatus.WAITLIST]} radius={[0, 0, 0, 0]} name="충원합격" />
                  <Bar dataKey={ResultStatus.FAIL} stackId="a" fill={RESULT_COLORS[ResultStatus.FAIL]} radius={[4, 4, 0, 0]} name="불합격" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Table below the chart */}
            <div className="mt-6 border-t border-slate-50 pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">유형별 통계 요약</h3>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-3 py-2">전형</th>
                      <th className="px-3 py-2 text-center">합격</th>
                      <th className="px-3 py-2 text-center">충원</th>
                      <th className="px-3 py-2 text-center">불합</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {chartData.map((d) => (
                      <tr key={d.name} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-slate-700">{d.name}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-emerald-600">{d[ResultStatus.SUCCESS]}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-blue-600">{d[ResultStatus.WAITLIST]}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-rose-500">{d[ResultStatus.FAIL]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
            <Sparkles className="absolute top-[-10px] right-[-10px] w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold">AI 데이터 분석 리포트</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed min-h-[60px]">
                {aiInsight || "검색 결과 데이터를 분석하여 올해의 입시 트렌드와 지원 전략을 AI가 제안해 드립니다."}
              </p>
              <button 
                onClick={handleAskAI}
                disabled={analyzing}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {analyzing ? <><RefreshCcw className="animate-spin" size={16} /> 분석 중...</> : <><Sparkles size={16} /> 분석 데이터 리포트 생성</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[700px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Calendar className="text-blue-500" size={18} />
              <h2 className="text-lg font-bold">상세 지원 데이터 현황</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">학년도 필터</span>
              <select 
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
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


import React from 'react';

interface StatCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  footer?: string;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, subtitle, value, footer, icon, iconBg }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-slate-400 text-xs mt-1">{title}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
      {footer && <div className="text-slate-500 text-xs font-medium pt-2 border-t border-slate-50">{footer}</div>}
    </div>
  );
};

export default StatCard;

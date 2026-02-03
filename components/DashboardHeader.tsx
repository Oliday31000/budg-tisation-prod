
import React from 'react';
import { SummaryStats } from '../types';

interface Props {
  stats: SummaryStats;
}

const DashboardHeader: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Chiffre d'Affaires</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCA.toLocaleString()} €</p>
        <div className="mt-2 flex items-center text-emerald-600 text-xs font-semibold">
          Performance Globale
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total des Coûts</p>
        <p className="text-2xl font-bold text-rose-500 mt-1">{stats.totalCouts.toLocaleString()} €</p>
        <div className="mt-2 text-slate-400 text-xs font-medium">
          Dépenses opérationnelles
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Bénéfice Net</p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.profitTotal.toLocaleString()} €</p>
        <div className="mt-2 flex items-center text-emerald-600 text-xs font-semibold">
          Rentabilité positive
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Marge Moyenne</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.margeMoyenne.toFixed(1)}%</p>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full" 
            style={{ width: `${Math.min(stats.margeMoyenne, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

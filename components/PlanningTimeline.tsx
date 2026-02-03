
import React from 'react';
import { PlanningTask } from '../types';
import { exportPlanningToCSV } from '../services/planningService';

interface Props {
  tasks: PlanningTask[];
  startDate: string;
  onMove?: (id: string, direction: 'up' | 'down') => void;
  isAdmin?: boolean;
}

const PlanningTimeline: React.FC<Props> = ({ tasks, startDate, onMove, isAdmin }) => {
  // Calcul strict de la somme des jours (aligné sur le devis)
  const totalProjectDays = tasks.reduce((acc, t) => acc + t.duration, 0);
  const viewWidthDays = Math.max(totalProjectDays, 14); 

  return (
    <div className="space-y-10">
      <div className="flex justify-end no-print">
        <button 
          onClick={() => exportPlanningToCSV(tasks, startDate, totalProjectDays)}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Exporter CSV (Google Sheets)</span>
        </button>
      </div>

      <div className="relative overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-[1200px]">
          {/* Header Grid */}
          <div className="flex mb-6 border-b border-slate-100 pb-3">
            <div className="w-80 flex-shrink-0 text-[10px] font-black text-slate-300 uppercase tracking-widest">Séquençage Métiers</div>
            <div className="flex-grow flex border-l border-slate-200 pl-6">
               {Array.from({ length: Math.ceil(viewWidthDays / 7) }).map((_, i) => (
                 <div key={i} className="flex-grow text-[9px] font-black text-slate-400 uppercase text-center border-r border-slate-50">
                    Semaine {i + 1}
                 </div>
               ))}
            </div>
          </div>

          {/* Rows */}
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const leftOffset = (task.startDay / viewWidthDays) * 100;
              const width = (task.duration / viewWidthDays) * 100;
              const originalId = task.id.replace('task-', '');

              return (
                <div key={task.id} className="flex items-center group">
                  <div className="w-80 flex-shrink-0 pr-6 flex items-center">
                    {isAdmin && onMove && (
                      <div className="flex flex-col mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onMove(originalId, 'up')} className="p-1 hover:text-indigo-600 transition-colors" title="Monter">▲</button>
                        <button onClick={() => onMove(originalId, 'down')} className="p-1 hover:text-indigo-600 transition-colors" title="Descendre">▼</button>
                      </div>
                    )}
                    <div className="bg-slate-900 text-white text-[11px] font-black w-8 h-8 flex items-center justify-center rounded-xl mr-4 shadow-sm">
                        {idx + 1}
                    </div>
                    <div className="truncate">
                        <div className="text-xs font-black text-slate-800 tracking-tight">{task.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: task.color || '#ccc' }}></span>
                          {task.phase}
                        </div>
                    </div>
                  </div>
                  <div className="flex-grow h-10 bg-slate-50 rounded-2xl relative border border-slate-100 group-hover:bg-slate-100 transition-colors">
                    <div 
                      className="absolute top-2 h-6 rounded-lg shadow-sm transition-all duration-700 flex items-center justify-center border border-white/20"
                      style={{ 
                        left: `${leftOffset}%`, 
                        width: `${width}%`, 
                        backgroundColor: task.color || '#6366f1'
                      }}
                    >
                      <div className="px-2 text-[8px] font-black text-white uppercase whitespace-nowrap overflow-hidden">
                        {task.duration}J
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Summary Summary */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-center shadow-2xl max-w-md animate-in zoom-in duration-500">
          <div className="flex items-center space-x-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Cycle de Production</div>
          </div>
          <div className="text-5xl font-black">{totalProjectDays} Jours</div>
          <div className="mt-2 text-indigo-200 text-xs font-bold uppercase tracking-wide">Charge Totale (Strict Devis)</div>
          <div className="mt-6 pt-6 border-t border-white/20 text-[10px] font-black uppercase tracking-widest flex justify-between items-center">
              <span>Clôture Estimée</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {new Date(new Date(startDate).getTime() + totalProjectDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
          </div>
      </div>
    </div>
  );
};

export default PlanningTimeline;


import React from 'react';
import { FinancialItem, UserRole } from '../types';

interface Props {
  item: FinancialItem;
  onUpdate: (id: string, updates: Partial<FinancialItem>) => void;
  onDelete: (id: string) => void;
  role: UserRole;
  onMove?: (id: string, direction: 'up' | 'down') => void;
}

const CalculatorRow: React.FC<Props> = ({ item, onUpdate, onDelete, role, onMove }) => {
  const isAdmin = role === 'admin';
  const coutTotal = item.coutUnitaire * item.jours;
  const prixVenteTotal = item.prixVenteJournalier * item.jours;
  const profit = prixVenteTotal - coutTotal;
  const marge = prixVenteTotal > 0 ? (profit / prixVenteTotal) * 100 : 0;

  return (
    <tr className="hover:bg-indigo-50/30 transition-all border-b border-slate-50 last:border-0 group">
      <td className="px-8 py-5">
        <div className="flex items-center">
          {isAdmin && onMove && (
            <div className="flex flex-col mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onMove(item.id, 'up')} className="text-[10px] text-slate-400 hover:text-indigo-600">▲</button>
              <button onClick={() => onMove(item.id, 'down')} className="text-[10px] text-slate-400 hover:text-indigo-600">▼</button>
            </div>
          )}
          <div>
            <div className="text-sm font-black text-slate-900">{item.designation}</div>
            <div className="text-[9px] text-indigo-500 font-bold uppercase mt-1">
              Choisi le {item.lastProviderUpdate ? new Date(item.lastProviderUpdate).toLocaleDateString() : 'Aujourd\'hui'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">
          {item.responderEmail || "Direct Admin"}
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex justify-center">
          <input type="number" value={item.jours} onChange={e => onUpdate(item.id, { jours: parseFloat(e.target.value) || 0 })} className="w-14 text-center font-black text-indigo-600 bg-slate-100 rounded-lg py-1 border-none focus:ring-0 outline-none" />
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center text-xs font-black text-slate-700">
          <input type="number" value={item.coutUnitaire} onChange={e => onUpdate(item.id, { coutUnitaire: parseFloat(e.target.value) || 0 })} className="w-16 bg-transparent border-none text-right outline-none p-0" />
          <span className="ml-1 opacity-40">€</span>
        </div>
      </td>
      <td className="px-8 py-5 text-right">
        <div className={`text-sm font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{profit.toLocaleString()}€</div>
        <div className="text-[9px] font-bold text-slate-300">{marge.toFixed(1)}% marge</div>
        <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-[8px] text-rose-300 uppercase font-black absolute right-2 mt-[-10px] transition-opacity">Retirer</button>
      </td>
    </tr>
  );
};

export default CalculatorRow;

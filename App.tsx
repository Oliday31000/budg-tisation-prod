
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialItem, SummaryStats, HistoryItem, ProjectType, PlanningTask, UserSession, UserRole, InvitedMember } from './types';
import DashboardHeader from './components/DashboardHeader';
import PlanningTimeline from './components/PlanningTimeline';
import { generatePlanning } from './services/planningService';

const HISTORY_KEY = 'vr_show_history_archive_v13';

const INITIAL_POSITIONS = [
  "Chef de projet / Direction de production",
  "Scénariste immersif",
  "Directeur artistique",
  "Modeleur 3D",
  "Animateur 3D",
  "Cadreur vidéo 360",
  "Monteur vidéo 360",
  "Sound designer",
  "Intégrateur Unity",
  "Intégrateur WebGL",
  "Développeur VR senior",
  "Comédien",
  "QA / Test VR"
];

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loginForm, setLoginForm] = useState({ code: '', email: '', projectPass: '' });
  
  const [projectName, setProjectName] = useState('Nouveau Projet');
  const [projectBrief, setProjectBrief] = useState('');
  const [customPositions, setCustomPositions] = useState<string[]>(INITIAL_POSITIONS);
  const [newPosInput, setNewPosInput] = useState('');
  const [requiredRoles, setRequiredRoles] = useState<string[]>([]);
  const [invitedTeam, setInvitedTeam] = useState<InvitedMember[]>(() => 
    Array.from({ length: 10 }, () => ({ email: '', code: Math.floor(1000 + Math.random() * 9000).toString() }))
  );

  const [providerResponses, setProviderResponses] = useState<FinancialItem[]>([]);
  const [finalQuote, setFinalQuote] = useState<FinancialItem[]>([]);
  const [globalMargin, setGlobalMargin] = useState(40);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'setup' | 'team' | 'estimate' | 'devis' | 'planning'>('setup');
  const [projectType, setProjectType] = useState<ProjectType>('UnityVR');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const stats: SummaryStats = useMemo(() => {
    let totalCA = 0, totalCouts = 0, totalJours = 0;
    finalQuote.forEach(item => {
      totalCA += (item.prixVenteJournalier * item.jours);
      totalCouts += (item.coutUnitaire * item.jours);
      totalJours += item.jours;
    });
    const currentMarge = totalCA > 0 ? ((totalCA - totalCouts) / totalCA) * 100 : 0;
    return { totalCA, totalCouts, profitTotal: totalCA - totalCouts, margeMoyenne: currentMarge, totalJours };
  }, [finalQuote]);

  const applyGlobalMargin = (margin: number) => {
    setGlobalMargin(margin);
    setFinalQuote(prev => prev.map(item => ({
      ...item,
      prixVenteJournalier: Math.round(item.coutUnitaire / (1 - (margin / 100)))
    })));
  };

  const handleLogin = () => {
    if (loginForm.code === '1982') setSession({ role: 'admin', isAuthenticated: true });
    else if (loginForm.code === '0000') setSession({ role: 'provider', email: loginForm.email, isAuthenticated: true });
  };

  const selectProviderForQuote = (response: FinancialItem) => {
    setFinalQuote(prev => {
      const filtered = prev.filter(p => p.designation !== response.designation);
      const withMargin = { ...response, prixVenteJournalier: Math.round(response.coutUnitaire / (1 - (globalMargin / 100))) };
      return [...filtered, { ...withMargin, id: Math.random().toString() }].sort((a,b) => (a.order || 0) - (b.order || 0));
    });
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const idx = finalQuote.findIndex(q => q.id === id);
    if (idx === -1) return;
    const newQuote = [...finalQuote];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target >= 0 && target < newQuote.length) {
      [newQuote[idx], newQuote[target]] = [newQuote[target], newQuote[idx]];
      setFinalQuote(newQuote.map((q, i) => ({ ...q, order: i })));
    }
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Supprimer définitivement ce projet de l'historique ?")) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const addCustomPosition = () => {
    if (newPosInput.trim() && !customPositions.includes(newPosInput.trim())) {
      setCustomPositions([...customPositions, newPosInput.trim()]);
      setNewPosInput('');
    }
  };

  const removePosition = (pos: string) => {
    setCustomPositions(customPositions.filter(p => p !== pos));
    setRequiredRoles(requiredRoles.filter(p => p !== pos));
  };

  const groupedResponses = useMemo(() => {
    const groups: Record<string, FinancialItem[]> = {};
    providerResponses.forEach(resp => {
      if (!groups[resp.designation]) groups[resp.designation] = [];
      groups[resp.designation].push(resp);
    });
    return groups;
  }, [providerResponses]);

  const isAdmin = session?.role === 'admin';

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 text-white text-3xl font-black">VR</div>
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Portail VR SHOW</h2>
          <div className="space-y-4">
            <input type="password" value={loginForm.code} onChange={e => setLoginForm({...loginForm, code: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Code (1982 / 0000)" />
            {loginForm.code === '0000' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Email" />
                <input type="password" value={loginForm.projectPass} onChange={e => setLoginForm({...loginForm, projectPass: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Code Projet" />
              </div>
            )}
            <button onClick={handleLogin} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest mt-4 shadow-xl">Connexion</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {isAdmin && (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col no-print">
          <div className="p-8 border-b border-slate-100">
            <button onClick={() => {setFinalQuote([]); setProjectName('Nouveau Projet'); setActiveTab('setup');}} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">+ Créer Projet</button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {history.map(h => (
              <div key={h.id} className="relative group">
                <button onClick={() => {setProjectName(h.name); setFinalQuote(h.data); setProjectBrief(h.brief); setInvitedTeam(h.invitedTeam);}} className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                  <div className="text-xs font-black text-slate-800 group-hover:text-indigo-600 truncate pr-8">{h.name}</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{h.date}</div>
                </button>
                <button onClick={(e) => deleteFromHistory(e, h.id)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-rose-500">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}

      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 flex items-center justify-between no-print">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-black text-slate-900 truncate max-w-[300px]">{projectName}</h1>
          </div>
          {isAdmin && (
            <div className="bg-slate-100 p-1 rounded-xl flex">
              {['setup', 'team', 'estimate', 'devis', 'planning'].map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>
                  {i+1}. {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <button onClick={() => {
                const item: HistoryItem = { id: Date.now().toString(), name: projectName, date: new Date().toLocaleDateString(), data: finalQuote, stats, invitedTeam, brief: projectBrief };
                setHistory([item, ...history]);
                alert("Sauvegardé");
              }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              </button>
            )}
            <button onClick={() => setSession(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">🚪</button>
          </div>
        </nav>

        <div className="p-8 max-w-[1400px] mx-auto w-full">
          {isAdmin ? (
            <div className="animate-in fade-in duration-500 space-y-8">
              {activeTab === 'setup' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h2 className="text-2xl font-black mb-6">1. Initialisation</h2>
                    <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nom du projet..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold mb-8 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                    <div className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Ajouter un poste personnalisé</h3>
                      <div className="flex gap-3">
                        <input type="text" value={newPosInput} onChange={e => setNewPosInput(e.target.value)} className="flex-grow px-4 py-2 bg-white rounded-xl text-sm font-bold border border-slate-200 outline-none" placeholder="Ex: Lead XR..." />
                        <button onClick={addCustomPosition} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">Ajouter</button>
                      </div>
                    </div>

                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Sélection des Postes Requis</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {customPositions.map(pos => (
                        <div key={pos} className="relative group">
                          <label className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${requiredRoles.includes(pos) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
                            <input type="checkbox" className="hidden" checked={requiredRoles.includes(pos)} onChange={() => setRequiredRoles(prev => prev.includes(pos) ? prev.filter(r => r !== pos) : [...prev, pos])} />
                            <span className={`text-xs font-bold truncate pr-4 ${requiredRoles.includes(pos) ? 'text-indigo-700' : 'text-slate-500'}`}>{pos}</span>
                          </label>
                          <button onClick={() => removePosition(pos)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-2xl font-black mb-6">Briefing Projet</h2>
                    <textarea value={projectBrief} onChange={e => setProjectBrief(e.target.value)} className="flex-grow w-full p-6 bg-slate-50 rounded-3xl font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Instructions détaillées..." />
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">2. Équipe & Accès</h2>
                    <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Envoyer les invitations</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {invitedTeam.map((m, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input type="email" value={m.email} onChange={e => {const nt = [...invitedTeam]; nt[i].email = e.target.value; setInvitedTeam(nt);}} className="w-full bg-transparent border-none text-[11px] font-bold p-0 mb-2" placeholder="Email..." />
                        <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-400">CODE:</span><span className="text-xs font-black text-indigo-500">{m.code}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'estimate' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-8">
                    <h3 className="text-lg font-black flex items-center justify-between">
                      Comparaison des Réponses 
                      <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{providerResponses.length}</span>
                    </h3>
                    <div className="space-y-12">
                      {Object.entries(groupedResponses).map(([category, items]) => {
                        const minPrice = Math.min(...items.map(it => it.coutUnitaire * it.jours));
                        const maxPrice = Math.max(...items.map(it => it.coutUnitaire * it.jours));
                        
                        return (
                          <div key={category} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 border-b border-indigo-100 pb-2">{category}</h4>
                            {items.map(resp => {
                              const total = resp.coutUnitaire * resp.jours;
                              const isMin = items.length > 1 && total === minPrice;
                              const isMax = items.length > 1 && total === maxPrice;
                              
                              return (
                                <div 
                                  key={resp.id} 
                                  onClick={() => selectProviderForQuote(resp)} 
                                  className={`p-5 bg-white rounded-3xl border-2 transition-all cursor-pointer group relative ${isMin ? 'border-emerald-500 shadow-emerald-50 shadow-lg' : isMax ? 'border-rose-500' : 'border-slate-100 hover:border-indigo-400'}`}
                                >
                                  {isMin && <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Meilleur Prix</span>}
                                  {isMax && <span className="absolute -top-3 left-4 bg-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Plus Cher</span>}
                                  
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-sm text-slate-800">{resp.firstName} {resp.lastName}</span>
                                    <span className={`text-xs font-black ${isMin ? 'text-emerald-600' : isMax ? 'text-rose-600' : 'text-indigo-600'}`}>{total.toLocaleString()} €</span>
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{resp.companyName || "Indépendant"}</div>
                                  
                                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-500">
                                    <span>{resp.coutUnitaire}€/j x {resp.jours}j</span>
                                    <span className="text-[8px] font-black text-white bg-indigo-600 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100">SÉLECTIONNER</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-8">
                    <DashboardHeader stats={stats} />
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                       <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] uppercase font-black text-slate-400">
                          <tr><th className="px-8 py-4">Rôle Sélectionné</th><th className="px-4 py-4">Expert</th><th className="px-4 py-4 text-center">Jours</th><th className="px-4 py-4 text-right">Coût/J</th><th className="px-8 py-4 text-right">Total Coût</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {finalQuote.map(q => (
                            <tr key={q.id} className="group hover:bg-slate-50/50">
                              <td className="px-8 py-4 font-black text-sm text-slate-900">{q.designation}</td>
                              <td className="px-4 py-4">
                                <div className="text-xs font-bold text-slate-500">{q.firstName} {q.lastName}</div>
                                <div className="text-[9px] font-medium text-slate-400">{q.companyName}</div>
                              </td>
                              <td className="px-4 py-4 text-center font-black text-indigo-600">{q.jours}</td>
                              <td className="px-4 py-4 text-right font-black text-slate-700">{q.coutUnitaire}€</td>
                              <td className="px-8 py-4 text-right font-black text-slate-900">{(q.jours * q.coutUnitaire).toLocaleString()}€</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'devis' && (
                <div className="space-y-8">
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900">4. Facturation & Rentabilité</h2>
                        <p className="text-sm text-slate-400 font-medium">Ajustez les prix de vente pour définir la marge finale.</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 min-w-[300px]">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Marge Globale Ciblée</span>
                          <span className="text-lg font-black text-indigo-600">{globalMargin}%</span>
                        </div>
                        <input type="range" min="10" max="70" step="5" value={globalMargin} onChange={e => applyGlobalMargin(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[9px] uppercase font-black text-slate-400">
                          <tr>
                            <th className="px-8 py-5">Poste</th>
                            <th className="px-4 py-5 text-center">Jours</th>
                            <th className="px-4 py-5 text-right">Coût Interne Total</th>
                            <th className="px-4 py-5 text-right">Prix Vente / J</th>
                            <th className="px-4 py-5 text-right">Total Vente Client</th>
                            <th className="px-8 py-5 text-right">Marge %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {finalQuote.map(item => {
                            const coutTotal = item.coutUnitaire * item.jours;
                            const venteTotal = item.prixVenteJournalier * item.jours;
                            const marge = venteTotal > 0 ? ((venteTotal - coutTotal) / venteTotal) * 100 : 0;

                            return (
                              <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                                <td className="px-8 py-5 font-black text-slate-800 text-sm">{item.designation}</td>
                                <td className="px-4 py-5 text-center font-bold text-slate-500">{item.jours}</td>
                                <td className="px-4 py-5 text-right font-bold text-rose-500">{coutTotal.toLocaleString()}€</td>
                                <td className="px-4 py-5 text-right">
                                  <input type="number" value={item.prixVenteJournalier} onChange={e => setFinalQuote(finalQuote.map(f => f.id === item.id ? {...f, prixVenteJournalier: parseFloat(e.target.value) || 0} : f))} className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500" />
                                </td>
                                <td className="px-4 py-5 text-right font-black text-indigo-600">{venteTotal.toLocaleString()}€</td>
                                <td className="px-8 py-5 text-right font-black text-slate-800">{marge.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white">
                          <tr>
                            <td className="px-8 py-6 font-black text-sm uppercase">Total Projet</td>
                            <td className="px-4 py-6 text-center font-black">{stats.totalJours} J</td>
                            <td className="px-4 py-6 text-right font-black text-rose-300">{stats.totalCouts.toLocaleString()}€</td>
                            <td className="px-4 py-6"></td>
                            <td className="px-4 py-6 text-right font-black text-emerald-300 text-lg">{stats.totalCA.toLocaleString()}€</td>
                            <td className="px-8 py-6 text-right font-black text-emerald-300">{stats.margeMoyenne.toFixed(1)}%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'planning' && (
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black">5. Ordonnancement Planning</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Utilisez les flèches pour réorganiser</p>
                  </div>
                  <PlanningTimeline tasks={generatePlanning(finalQuote, projectType)} startDate={startDate} onMove={moveItem} isAdmin={true} />
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                   <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">!</div>
                   <h2 className="text-2xl font-black text-slate-900">Briefing & Consignes</h2>
                </div>
                <div className="p-8 bg-slate-900 rounded-[2rem] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap border border-slate-800">
                  {projectBrief || "Veuillez vous référer aux instructions orales de l'administrateur."}
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black mb-8">Votre Proposition Commerciale</h2>
                <ProviderMultiForm requiredRoles={requiredRoles} onSubmit={(lines, info) => {
                  const items: FinancialItem[] = lines.map(l => ({
                    id: Math.random().toString(), designation: l.role, category: 'Production', produit: 'Service', 
                    coutUnitaire: l.cost, prixVenteJournalier: l.cost * 1.5, jours: l.days, 
                    responderEmail: session.email, lastProviderUpdate: new Date().toISOString(),
                    firstName: info.firstName, lastName: info.lastName, companyName: info.companyName
                  }));
                  setProviderResponses([...providerResponses, ...items]);
                  alert("Votre proposition a bien été transmise.");
                }} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProviderMultiForm: React.FC<{requiredRoles: string[], onSubmit: (l: {role: string, cost: number, days: number}[], info: {firstName: string, lastName: string, companyName: string}) => void}> = ({ requiredRoles, onSubmit }) => {
  const [selected, setSelected] = useState<{role: string, cost: number, days: number}[]>([]);
  const [info, setInfo] = useState({ firstName: '', lastName: '', companyName: '' });
  const rolesToDisplay = requiredRoles.length > 0 ? requiredRoles : INITIAL_POSITIONS;

  const totalDays = selected.reduce((acc, curr) => acc + curr.days, 0);
  const totalAmount = selected.reduce((acc, curr) => acc + (curr.cost * curr.days), 0);

  const isFormValid = info.firstName && info.lastName && info.companyName && selected.length > 0 && selected.every(s => s.cost > 0 && s.days > 0);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Prénom</label>
          <input type="text" value={info.firstName} onChange={e => setInfo({...info, firstName: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Jean" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Nom</label>
          <input type="text" value={info.lastName} onChange={e => setInfo({...info, lastName: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Dupont" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Société</label>
          <input type="text" value={info.companyName} onChange={e => setInfo({...info, companyName: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom de votre entreprise" />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 border-l-4 border-indigo-600 pl-4">Sélectionnez vos postes</h3>
        <div className="flex flex-wrap gap-2 mb-8">
          {rolesToDisplay.map(pos => (
            <button key={pos} onClick={() => !selected.some(s => s.role === pos) && setSelected([...selected, { role: pos, cost: 0, days: 0 }])} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selected.some(s => s.role === pos) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'}`}>
              + {pos}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          {selected.map((item, i) => (
            <div key={item.role} className="flex flex-col md:flex-row md:items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-left-4 transition-all">
              <div className="flex-grow font-black text-sm text-slate-800">{item.role}</div>
              <div className="flex items-center gap-4">
                 <div className="w-32">
                   <label className="block text-[8px] font-black uppercase text-slate-400 mb-1 ml-2">Prix / Jour (€)</label>
                   <input type="number" placeholder="0" value={item.cost} onChange={e => {const ns = [...selected]; ns[i].cost = parseFloat(e.target.value) || 0; setSelected(ns);}} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div className="w-32">
                   <label className="block text-[8px] font-black uppercase text-slate-400 mb-1 ml-2">Nb Jours</label>
                   <input type="number" placeholder="0" value={item.days} onChange={e => {const ns = [...selected]; ns[i].days = parseFloat(e.target.value) || 0; setSelected(ns);}} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div className="w-32 text-right">
                    <label className="block text-[8px] font-black uppercase text-slate-400 mb-1">Sous-total</label>
                    <div className="text-sm font-black text-indigo-600">{(item.cost * item.days).toLocaleString()} €</div>
                 </div>
                 <button onClick={() => setSelected(selected.filter((_, idx) => idx !== i))} className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl font-bold hover:bg-rose-100 transition-colors">×</button>
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Total de votre offre</p>
                  <div className="text-3xl font-black text-indigo-600">{totalAmount.toLocaleString()} €</div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Charge de travail</p>
                  <div className="text-3xl font-black text-indigo-600">{totalDays} Jours</div>
               </div>
            </div>
            <button 
              onClick={() => isFormValid && onSubmit(selected, info)} 
              disabled={!isFormValid}
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all ${isFormValid ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
            >
              {isFormValid ? 'Transmettre mon Devis Global' : 'Veuillez remplir tous les champs'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

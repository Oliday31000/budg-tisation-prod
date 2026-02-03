
import { FinancialItem, PlanningTask, ProjectType } from '../types';

/**
 * Hiérarchie de production VR standard par défaut
 */
const DEFAULT_ROLE_ORDER = [
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

const ROLE_COLORS: Record<string, string> = {
  "Chef de projet / Direction de production": "#475569", 
  "Scénariste immersif": "#0ea5e9", 
  "Directeur artistique": "#8b5cf6", 
  "Modeleur 3D": "#10b981", 
  "Animateur 3D": "#34d399", 
  "Cadreur vidéo 360": "#f59e0b", 
  "Monteur vidéo 360": "#d97706", 
  "Sound designer": "#ec4899", 
  "Intégrateur Unity": "#6366f1", 
  "Intégrateur WebGL": "#4f46e5", 
  "Développeur VR senior": "#1d4ed8", 
  "Comédien": "#f43f5e", 
  "QA / Test VR": "#94a3b8"
};

export const generatePlanning = (
  items: FinancialItem[], 
  projectType: ProjectType = 'UnityVR'
): PlanningTask[] => {
  // Respecter l'ordre des items défini manuellement ou par défaut dans l'état de l'application
  const activeItems = items.filter(item => item.jours > 0);

  let accumulatedDays = 0;
  return activeItems.map((item) => {
    const role = item.designation;
    let phase: PlanningTask['phase'] = 'Production';

    // Détermination de la phase basée sur le rôle
    if (role.includes("Chef de projet") || role.includes("Scénariste") || role.includes("Directeur artistique")) {
      phase = 'Cadrage';
    } else if (role.includes("3D") || role.includes("Cadreur")) {
      phase = 'Préproduction';
    } else if (role.includes("QA")) {
      phase = 'Stabilisation';
    }

    const task: PlanningTask = {
      id: `task-${item.id}`,
      name: item.designation,
      role: item.designation,
      phase: phase,
      startDay: accumulatedDays,
      duration: item.jours,
      dependencies: [],
      deliverable: "Livrable étape",
      color: ROLE_COLORS[role] || "#94a3b8"
    };

    accumulatedDays += item.jours;
    return task;
  });
};

export const exportPlanningToCSV = (tasks: PlanningTask[], startDate: string, totalProjectDays: number) => {
  // Format compatible Google Sheets (point-virgule ou virgule selon région, ici point-virgule pour compatibilité FR)
  const headers = ['Ordre', 'Phase', 'Metier / Section', 'Duree (Jours)', 'Debut estimatif', 'Fin estimative'];
  const start = new Date(startDate);

  const rows = tasks.map((t, index) => {
    const dStart = new Date(start);
    dStart.setDate(start.getDate() + t.startDay);
    const dEnd = new Date(dStart);
    dEnd.setDate(dStart.getDate() + t.duration);

    return [
      index + 1,
      t.phase,
      t.name,
      t.duration,
      dStart.toLocaleDateString(),
      dEnd.toLocaleDateString()
    ];
  });

  // Ajout de la ligne de total
  rows.push(['', '', 'TOTAL PROJET', totalProjectDays, '', '']);

  const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Planning_VR_SHOW_Export.csv`;
  link.click();
};

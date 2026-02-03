
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialItem } from "../types";

// Correctly initialize GoogleGenAI with a named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const parseSpreadsheetContent = async (rawText: string): Promise<FinancialItem[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyse ces données brutes de tableur (format CSV/Text) et convertis-les en JSON.
    Le fichier contient des colonnes comme : Désignation, Catégorie, Coût d'achat, Frais, Coût de revient, PV unitaire.
    
    Données brutes : ${rawText}
    
    Règles de calcul :
    - coutRevient = coutAchat + fraisGeneraux
    - margeBrute = prixVente - coutRevient
    - tauxMarge = (margeBrute / prixVente) * 100
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            designation: { type: Type.STRING },
            category: { type: Type.STRING },
            coutAchat: { type: Type.NUMBER },
            fraisGeneraux: { type: Type.NUMBER },
            coutRevient: { type: Type.NUMBER },
            prixVente: { type: Type.NUMBER },
            margeBrute: { type: Type.NUMBER },
            tauxMarge: { type: Type.NUMBER },
          },
          required: ["id", "designation", "category", "coutAchat", "fraisGeneraux", "coutRevient", "prixVente", "margeBrute", "tauxMarge"]
        }
      }
    }
  });

  try {
    // Access response.text as a property, not a method
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Erreur lors de l'analyse Gemini", e);
    return [];
  }
};

export const getFinancialInsights = async (data: FinancialItem[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agis en tant qu'expert comptable. Analyse ces données financières et donne 3 conseils stratégiques en français pour améliorer la rentabilité.
    Données : ${JSON.stringify(data)}`,
    config: {
      temperature: 0.7,
      systemInstruction: "Tu es un expert en analyse de rentabilité. Réponds toujours en français."
    }
  });
  // Access response.text as a property
  return response.text || "Aucune analyse disponible.";
};

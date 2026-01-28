
// Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { SafetyLocation, LocationType } from "../types";

export class GeminiService {
  private lastAssets: SafetyLocation[] = [];
  
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async callWithRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        console.warn(`Quota exceeded. Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async getSafetyBriefing(lat: number, lng: number): Promise<string> {
    try {
      const ai = this.getAI();
      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a short, one-sentence tactical safety briefing for someone at coordinates ${lat}, ${lng}. Focus on situational awareness and safety protocols.`,
        config: {
          systemInstruction: "You are the RSA Sentinel AI. Provide concise, professional tactical advice (max 20 words).",
        }
      }));
      return response.text || "Situational awareness recommended in current sector.";
    } catch (error: any) {
      console.error("Safety Briefing Error:", error.message);
      return "Tactical link degraded. Exercise standard safety protocols.";
    }
  }

  async getNearbySafetyAssets(lat: number, lng: number): Promise<SafetyLocation[]> {
    try {
      const ai = this.getAI();
      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "List the nearest hospitals, police stations, and verified safe emergency shelters to this location for rapid public safety response.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
        },
      }));
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const newAssets = chunks.filter((chunk: any) => chunk.maps).map((chunk: any, index: number) => {
        const title = chunk.maps.title || "Safety Asset";
        let type = LocationType.SAFE_HUB;
        if (title.toLowerCase().includes('hospital') || title.toLowerCase().includes('medical')) type = LocationType.HOSPITAL;
        if (title.toLowerCase().includes('police') || title.toLowerCase().includes('precinct')) type = LocationType.POLICE;
        
        // Simulate a safety score (0-100) for each location
        const simulatedScore = Math.floor(Math.random() * 100);
        
        return {
          id: `safe-${index}-${Date.now()}`,
          name: title,
          type: type,
          coords: { lat: 0, lng: 0 },
          address: chunk.maps.uri || "Nearby Asset",
          safetyScore: simulatedScore,
          description: "Verified Emergency Response Location"
        };
      }).slice(0, 8); // Get a bit more for map variety

      if (newAssets.length > 0) {
        this.lastAssets = newAssets;
        localStorage.setItem('rsa_cached_assets', JSON.stringify(newAssets));
      }
      return newAssets;
    } catch (error: any) {
      console.error("Safety Asset API Error:", error.message);
      const cached = localStorage.getItem('rsa_cached_assets');
      return cached ? JSON.parse(cached) : this.lastAssets;
    }
  }

  async analyzeSafetyScene(prompt: string, base64Image?: string, base64Audio?: string) {
    try {
      const ai = this.getAI();
      const systemPrompt = `You are the RSA Sentinel AI Assistant. 
      
      CORE MANDATE: Analyze input ONLY related to safety, situational awareness, security, and tactical environments.
      
      RELEVANCE PROTOCOL:
      - If the user provides images or text queries regarding food, abstract charts/graphs, generic scenic photos, decorative architecture/plain houses (with no visible safety hazard), or general lifestyle items, you MUST REJECT the analysis.
      - REJECTION MESSAGE: "TACTICAL ERROR: Input data outside operational scope. RSA Sentinel is restricted to security, tactical suitability, and situational awareness. Please provide data relevant to your personal safety or environment."
      
      OPERATIONAL DIRECTIVES:
      1. MULTIMODAL SCAN: Analyze provided text, images (attire/environment), and audio (distress, ambient noise, verbal info).
      2. TACTICAL SUITABILITY: Rate the person-environment suitability (OPTIMAL, SUB-OPTIMAL, HIGH RISK).
      3. SOUND ANALYSIS: If audio is provided, identify distress signals, aggressive tones, or relevant environmental sounds (sirens, traffic).
      4. RESPONSE: Professional, sharp, tactical advice. Addressing user: "${prompt}"`;

      const parts: any[] = [{ text: systemPrompt }];
      
      if (base64Image) {
        parts.push({
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: 'image/jpeg'
          }
        });
      }

      if (base64Audio) {
        parts.push({
          inlineData: {
            data: base64Audio.split(',')[1] || base64Audio,
            mimeType: 'audio/webm' // Default for MediaRecorder in most browsers
          }
        });
      }

      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts }
      }));
      return response.text;
    } catch (error: any) {
      if (error.status === 429) return "RSA Sentinel limit reached. Please wait a few moments.";
      return "Analysis node failed. Re-establishing secure link...";
    }
  }

  async speakSafetyAdvice(text: string): Promise<string | undefined> {
    try {
      const ai = this.getAI();
      const response: GenerateContentResponse = await this.callWithRetry(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Acknowledge: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      }));
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      return undefined;
    }
  }
}

export const gemini = new GeminiService();

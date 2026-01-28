
import React, { useState, useRef, useEffect } from 'react';
import { Send, Camera, Volume2, Loader2, Sparkles, X, ChevronRight, UserCircle, Shirt, Mic, Square, Play, Trash2 } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { ChatMessage, LibraryImage } from '../types';

interface SafetyAssistantProps {
  onCaptureEvidence?: (img: LibraryImage) => void;
}

const SUGGESTIONS = [
  { text: "Analyze my outfit for this location", icon: Shirt },
  { text: "Check if I am dressed correctly for this event", icon: UserCircle },
  { text: "Is this clothing safe for night walking?", icon: Sparkles },
  { text: "Analyze person and environment suitability", icon: Camera }
];

const SafetyAssistant: React.FC<SafetyAssistantProps> = ({ onCaptureEvidence }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for tactical audio capture.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioBase64(null);
    setAudioURL(null);
  };

  const handleSendMessage = async () => {
    if (!input && !image && !audioBase64) return;

    const currentText = input;
    const currentImage = image;
    const currentAudio = audioBase64;

    // Create message preview
    const userMsg: ChatMessage = { 
      role: 'user', 
      text: currentText || (currentImage ? 'Visual Analysis Requested' : 'Audio Analysis Requested'), 
      image: currentImage || undefined,
      audio: !!currentAudio
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    // Reset inputs
    setInput('');
    setImage(null);
    clearAudio();
    setLoading(true);

    try {
      const response = await gemini.analyzeSafetyScene(currentText, currentImage || undefined, currentAudio || undefined);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      
      if (currentImage && onCaptureEvidence) {
        onCaptureEvidence({
          id: Date.now().toString(),
          url: currentImage,
          timestamp: new Date().toISOString(),
          analysis: response
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Protocol Error: Tactical link unstable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const base64Audio = await gemini.speakSafetyAdvice(text);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Initial Suggestions */}
      {messages.length === 0 && (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Tactical Scan Commands</span>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i} 
                onClick={() => setInput(s.text)}
                className="w-full bg-slate-900 p-4 rounded-2xl border border-white/5 text-left hover:border-blue-500 hover:bg-slate-800 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <s.icon className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100" />
                  <span className="text-xs font-bold text-slate-300">{s.text}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-[1.5rem] p-4 shadow-xl ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-white/10 text-slate-200'
            }`}>
              {m.image && <img src={m.image} className="w-full h-48 object-cover rounded-xl mb-3 border border-white/10" />}
              {m.audio && (
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg mb-2">
                  <Mic className="w-3 h-3 text-blue-200" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-100">Audio Stream Processed</span>
                </div>
              )}
              <p className="text-xs leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>
              {m.role === 'model' && (
                <button onClick={() => playTTS(m.text)} className="mt-3 flex items-center gap-2 text-[8px] font-black uppercase opacity-60 hover:opacity-100">
                  <Volume2 className="w-3 h-3" /> Play Audio Advice
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-white/10 rounded-[1.5rem] p-4 flex items-center gap-3">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[10px] text-slate-500 font-black uppercase italic">Processing Tactical Data...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Staged Assets & Input */}
      <div className="p-4 bg-slate-900/50 border-t border-white/5 backdrop-blur-md">
        {/* Assets Preview Bar */}
        <div className="flex flex-wrap gap-3 mb-4">
          {image && (
            <div className="relative group animate-in zoom-in duration-200">
              <img src={image} className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500 shadow-lg" />
              <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 shadow-md"><X className="w-3 h-3" /></button>
            </div>
          )}
          {audioURL && (
            <div className="relative flex items-center gap-3 bg-slate-800 p-3 rounded-2xl border-2 border-emerald-500 animate-in slide-in-from-left duration-200 shadow-lg">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center animate-pulse">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Audio Staged</span>
                <audio src={audioURL} controls className="h-6 w-32 scale-90 origin-left" />
              </div>
              <button onClick={clearAudio} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        
        {/* Main Controls */}
        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-[2rem] shadow-inner border border-white/5">
          <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageUpload} />
          
          <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full text-slate-400 hover:text-blue-500 bg-slate-700/30 transition-all">
            <Camera className="w-5 h-5" />
          </button>

          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-3 rounded-full transition-all flex items-center justify-center ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse scale-125 z-50' 
                : audioBase64 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-400 hover:text-emerald-500 bg-slate-700/30'
            }`}
            title="Hold to Record Tactical Audio"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <input 
            className="flex-1 bg-transparent border-none focus:outline-none text-white text-xs px-2 font-medium"
            placeholder={isRecording ? "Recording Secure Feed..." : "Report incident detail..."}
            value={input}
            disabled={isRecording}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <button 
            onClick={handleSendMessage}
            disabled={loading || isRecording || (!input && !image && !audioBase64)}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-[7px] text-slate-500 font-black uppercase text-center mt-3 tracking-[0.3em] opacity-40 italic">
           {isRecording ? 'STREAMING ENCRYPTED AUDIO...' : 'RSA SENTINEL • MULTIMODAL SUITABILITY ENGINE'}
        </p>
      </div>
    </div>
  );
};

export default SafetyAssistant;


import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Maximize2, X, Calendar, Clock, ShieldAlert } from 'lucide-react';
import { LibraryImage } from '../types';

interface LibraryProps {
  images: LibraryImage[];
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ images, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null);

  return (
    <div className="flex-1 p-4 md:p-8 bg-blue-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] mb-1">Secure Asset Storage</p>
            <h1 className="text-3xl md:text-5xl font-black italic text-blue-950 uppercase tracking-tighter">Library</h1>
          </div>
          <div className="bg-white px-4 py-2 border-2 border-blue-100 rounded-2xl shadow-sm flex items-center gap-3">
             <ImageIcon className="w-4 h-4 text-blue-600" />
             <span className="text-[10px] font-black uppercase text-blue-900">{images.length} Captured Files</span>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 bg-white/50 border-4 border-dashed border-blue-100 rounded-[3rem]">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-blue-300" />
            </div>
            <div>
              <h3 className="text-blue-950 font-black uppercase italic text-xl">Library is Empty</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Upload images via Sentinel Assistant to populate your collection.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative bg-white rounded-[2rem] border border-blue-100 shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                  <img src={img.url} alt="Evidence" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                     <button 
                        onClick={() => setSelectedImage(img)}
                        className="bg-white/20 backdrop-blur-md p-3 rounded-xl text-white hover:bg-white/40 transition-colors"
                      >
                       <Maximize2 className="w-5 h-5" />
                     </button>
                     <button 
                        onClick={() => onDelete(img.id)}
                        className="bg-red-600 p-3 rounded-xl text-white hover:bg-red-700 transition-colors shadow-lg"
                      >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase">{new Date(img.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-mono font-bold">{new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-50">
                    <p className="text-[10px] font-black text-blue-950 uppercase tracking-tight line-clamp-2 italic leading-relaxed">
                      {img.analysis || "SECURE CAPTURE NODE #" + img.id.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {selectedImage && (
        <div className="fixed inset-0 z-[9999] bg-blue-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
           <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
           >
             <X className="w-10 h-10" />
           </button>

           <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                <img src={selectedImage.url} alt="Full Resolution" className="w-full max-h-[70vh] object-contain mx-auto" />
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="bg-red-600 text-white px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                    <ShieldAlert className="w-3 h-3 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Case File Restricted</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-80 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-white font-black italic uppercase text-2xl tracking-tighter">Tactical Analysis</h3>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Captured: {new Date(selectedImage.timestamp).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-slate-300 text-xs leading-relaxed italic font-medium">
                  "{selectedImage.analysis || 'No detailed analysis found for this file.'}"
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-700 transition-all"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.url;
                      link.download = `RSA_EVIDENCE_${selectedImage.id}.jpg`;
                      link.click();
                    }}
                   >
                     Download Asset
                   </button>
                   <button 
                    className="w-full bg-white/5 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all"
                    onClick={() => setSelectedImage(null)}
                   >
                     Close File
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Library;

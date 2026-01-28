
import React, { useState } from 'react';
import { Shield, Fingerprint, Lock, ShieldCheck, Zap, Mail, KeyRound, UserPlus, User, Loader2, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [authMethod, setAuthMethod] = useState<'BIOMETRIC' | 'MANUAL' | 'CREATE'>('BIOMETRIC');
  const [showRegSuccess, setShowRegSuccess] = useState(false);
  
  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleBiometricLogin = () => {
    setIsScanning(true);
    // Simulate biometric processing
    setTimeout(() => {
      setScanComplete(true);
      setTimeout(() => {
        onLogin();
      }, 800);
    }, 2000);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword.length >= 4) {
      onLogin();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    // Simulate RSA Identity Provisioning
    setTimeout(() => {
      setIsRegistering(false);
      setLoginEmail(regEmail); // Pre-fill login email
      setAuthMethod('MANUAL'); // Switch to Login view
      setShowRegSuccess(true);
      // Auto-hide success message after 5s
      setTimeout(() => setShowRegSuccess(false), 5000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-100/40 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[3rem] border border-blue-100 p-8 md:p-12 flex flex-col items-center relative z-10 shadow-[0_20px_60px_rgba(37,99,235,0.1)]">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 uppercase tracking-tighter italic mb-1">
            RSA SENTINEL
          </h1>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em]">
            Republica Safety AI • South Africa
          </p>
        </div>

        {/* Auth Method Switcher */}
        <div className="flex w-full bg-blue-50 rounded-2xl p-1 mb-10 border border-blue-100">
          <button 
            onClick={() => { setAuthMethod('BIOMETRIC'); setShowRegSuccess(false); }}
            disabled={isScanning || isRegistering}
            className={`flex-1 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'BIOMETRIC' ? 'bg-white text-blue-600 shadow-md border border-blue-100' : 'text-slate-400 hover:text-blue-500'}`}
          >
            Biometric
          </button>
          <button 
            onClick={() => { setAuthMethod('MANUAL'); setShowRegSuccess(false); }}
            disabled={isScanning || isRegistering}
            className={`flex-1 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-md border border-blue-100' : 'text-slate-400 hover:text-blue-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setAuthMethod('CREATE'); setShowRegSuccess(false); }}
            disabled={isScanning || isRegistering}
            className={`flex-1 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'CREATE' ? 'bg-white text-blue-600 shadow-md border border-blue-100' : 'text-slate-400 hover:text-blue-500'}`}
          >
            Create
          </button>
        </div>

        <div className="w-full min-h-[340px] flex flex-col items-center justify-center">
          {authMethod === 'BIOMETRIC' ? (
            <div className="w-full space-y-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="relative group">
                <div className={`absolute inset-0 bg-blue-400 rounded-full blur-2xl transition-opacity duration-1000 ${isScanning ? 'opacity-30' : 'opacity-10 group-hover:opacity-20'}`}></div>
                <button 
                  onClick={handleBiometricLogin}
                  disabled={isScanning}
                  className={`relative w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    scanComplete ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                    isScanning ? 'border-blue-500 bg-blue-50 scale-110 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 
                    'border-blue-100 hover:border-blue-500 bg-blue-50/30 hover:scale-105'
                  }`}
                >
                  {scanComplete ? (
                    <ShieldCheck className="w-20 h-20 text-white animate-bounce" />
                  ) : (
                    <Fingerprint className={`w-20 h-20 transition-colors duration-300 ${isScanning ? 'text-blue-600' : 'text-blue-200'}`} />
                  )}
                  
                  {isScanning && !scanComplete && (
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin"></div>
                  )}
                </button>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-blue-900 font-bold text-sm uppercase tracking-widest">
                  {scanComplete ? 'Identity Verified' : isScanning ? 'Decrypting Biometrics...' : 'Touch Sensor to Begin'}
                </h2>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto opacity-70">
                  Secure sector access requires valid RSA fingerprint or facial recognition data.
                </p>
              </div>
            </div>
          ) : authMethod === 'MANUAL' ? (
            <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {showRegSuccess && (
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-950 uppercase tracking-widest leading-tight">Identity Provisioned</p>
                    <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Sentinel ID: {regEmail}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleManualLogin} className="w-full space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="EMAIL ADDRESS" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-blue-950 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="PASSWORD" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-blue-950 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loginPassword.length < 4}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs italic transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Initialize Protocol
                </button>
                
                <div className="text-center">
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-relaxed opacity-60">
                    Secondary manual override for areas with restricted biometric hardware.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-4">
                 <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="FULL NAME" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-blue-950 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="EMAIL ADDRESS" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-blue-950 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="CREATE PASSWORD" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl py-4 pl-12 pr-4 text-blue-950 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isRegistering || regPassword.length < 6 || !regEmail || !regName}
                className={`w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs italic transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  isRegistering ? 'bg-emerald-600 cursor-wait' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
                }`}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Provisioning RSA ID...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Complete Registration
                  </>
                )}
              </button>
              
              <div className="text-center">
                 <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-relaxed opacity-60">
                   By registering, you agree to local RSA surveillance and data collection protocols.
                 </p>
              </div>
            </form>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-blue-50 w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock className="w-3 h-3" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]">End-to-End RSA Encryption Active</span>
          </div>
          <div className="flex gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShoppingBag, 
  Coffee, 
  Sparkles, 
  Briefcase, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Search,
  Wallet,
  Moon,
  Sun,
  X,
  Edit3,
  Camera,
  Heart,
  Gift,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  RefreshCw,
  ArrowLeft,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Types ---
interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  vibe: 'high' | 'neutral' | 'low';
  dailyMove: number;
  narrative: string;
  quantity: number;
  avgBuyPrice: number;
  totalValue: number;
  type: 'stock' | 'crypto';
  dividends?: number;
  investedValue?: number;
  result?: number;
  dividendsGained?: number;
  dividendsCash?: number;
  dividendsReinvested?: number;
  slice?: string;
}

interface Goal {
  name: string;
  amount: number;
  icon: string;
}

type Theme = 'light' | 'dark';
type ColorGrade = 'default' | 'champagne' | 'espresso' | 'lavender' | 'silver';
type Currency = 'GBP' | 'USD' | 'EUR';

interface UserData {
  name: string;
  email: string;
  dob: string;
  gender: string;
  phone: string;
  phoneCode: string;
  avatar: string;
}

interface SecuritySettings {
  passcodeEnabled: boolean;
  biometricEnabled: boolean;
  twoStepEnabled: boolean;
  marketingPrefs: boolean;
  dataProtection: boolean;
  currentPasscode: string;
}

type SettingsSubTab = 'main' | 'two-step' | 'passcode' | 'biometric' | 'marketing' | 'data-protection';

interface AppContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  toggleTheme: () => void;
  colorGrade: ColorGrade;
  setColorGrade: (grade: ColorGrade) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  stocks: Stock[];
  setStocks: React.Dispatch<React.SetStateAction<Stock[]>>;
  vibeCheckStock: (ticker: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  goalData: { name: string; target: number };
  setGoalData: React.Dispatch<React.SetStateAction<{ name: string; target: number }>>;
  wishlistItems: Goal[];
  setWishlistItems: React.Dispatch<React.SetStateAction<Goal[]>>;
  totalBalance: number;
  totalProfit: number;
  totalResult: number;
  totalDividends: number;
  brokerApiKey: string;
  accountType: string | null;
  setBrokerApiKey: (key: string) => void;
  isMockMode: boolean;
  setIsMockMode: (val: boolean) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  isPriceAlertsEnabled: boolean;
  setIsPriceAlertsEnabled: (val: boolean) => void;
  // Privacy & Security States
  securitySettings: SecuritySettings;
  setSecuritySettings: React.Dispatch<React.SetStateAction<SecuritySettings>>;
  isSettingsDirty: boolean;
  setIsSettingsDirty: (val: boolean) => void;
  triggerSaveSettings: () => void;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (val: boolean) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  isRefreshing: boolean;
  lastSyncError: string | null;
  serverIp: string | null;
  lastUpdated: string | null;
  aiInsights: string | null;
  isGeneratingInsights: boolean;
  handleCsvUpload: (file: File) => Promise<void>;
  refreshPrices: () => Promise<void>;
  resetPortfolio: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp?: Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Utilities ---
const currencySymbols: Record<Currency, string> = { GBP: '£', USD: '$', EUR: '€' };
const currencyRates: Record<Currency, number> = { GBP: 1, USD: 1.25, EUR: 1.15 };

const formatCurrency = (amount: number, currency: Currency) => {
  const converted = amount * (currencyRates[currency] || 1);
  return `${currencySymbols[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- Animation Components ---

const PortfolioGraph = ({ data, color = "#ff4d8d", height = 200 }: { data: any[], color?: string, height?: number }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif'
            }}
            labelStyle={{ display: 'none' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StockSparkline = ({ change = 0 }: { change?: number }) => {
  // Generate a random-ish but trend-followed mock sparkline
  const data = useMemo(() => {
    const points = 12; // Increased points for smoother line
    const result = [];
    let current = 100;
    for (let i = 0; i < points; i++) {
      const volatility = 3; // Slightly more volatility for "moving" feel
      const trend = (change / points);
      current += (Math.random() - 0.5) * volatility + trend;
      result.push({ value: current });
    }
    return result;
  }, [change]);

  const color = change >= 0 ? "#10b981" : "#ef4444";

  return (
    <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2}
            fill={color}
            fillOpacity={0.1}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnimatedPrice = ({ value, currency, className = "" }: { value: number | undefined, currency: Currency, className?: string }) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return (
    <motion.span
      key={safeValue}
      initial={{ opacity: 0.7, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {formatCurrency(safeValue, currency)}
    </motion.span>
  );
};

const FlashUpdate = ({ 
  value, 
  children, 
  className = "", 
  isPositive = true 
}: { 
  value: any, 
  children: React.ReactNode, 
  className?: string, 
  isPositive?: boolean 
}) => {
  return (
    <motion.div
      key={value}
      animate={{ 
        backgroundColor: [
          "rgba(0,0,0,0)", 
          isPositive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)", 
          "rgba(0,0,0,0)"
        ],
        scale: [1, 1.02, 1]
      }}
      transition={{ duration: 0.6 }}
      className={`rounded-lg px-2 -mx-2 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// --- Components ---

const NFABanner = () => (
  <div className="bg-black py-2 overflow-hidden relative">
    <motion.div 
      className="flex whitespace-nowrap gap-8 text-[10px] items-center"
      animate={{ x: [0, -1000] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="font-serif italic tracking-wide text-white uppercase font-bold">
          ✨ Manifesting wealth is a solo journey. Not Financial Advice, just big energy. ✨
        </span>
      ))}
    </motion.div>
  </div>
);

const Header = () => {
  const { theme, toggleTheme, userData, setUserData, setActiveTab, hasUnreadNotifications } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRemovePhoto = () => {
    setUserData(p => ({ ...p, avatar: '' }));
    setShowPhotoMenu(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserData(p => ({ ...p, avatar: url }));
      setShowPhotoMenu(false);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setShowPhotoMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Oops, couldn't access your camera babe! xxx");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL('image/png');
      setUserData(p => ({ ...p, avatar: url }));
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };
  
  return (
    <>
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div 
              className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-rose shadow-sm transition-transform active:scale-95 bg-neutral-100 flex items-center justify-center"
              onClick={() => setShowPhotoMenu(!showPhotoMenu)}
            >
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <DollarSign className="w-6 h-6 text-neutral-400" />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <AnimatePresence>
              {showPhotoMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-50 w-48"
                >
                  <button onClick={handleRemovePhoto} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-neutral-50 flex items-center gap-2">
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                  <button onClick={handleUploadClick} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-neutral-50 flex items-center gap-2">
                    <Plus className="w-3 h-3" /> Upload Photo
                  </button>
                  <button onClick={startCamera} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-neutral-50 flex items-center gap-2">
                    <Camera className="w-3 h-3" /> Take a Photo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

            <div className="absolute -bottom-1 -right-1 bg-brand-sage w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-bg transition-colors duration-300">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div onClick={() => setActiveTab('Settings')} className="cursor-pointer">
            <h2 className="text-sm font-medium text-text-primary/60 uppercase tracking-widest leading-none mb-1">Hey!</h2>
            <h1 className="text-2xl font-serif font-semibold text-text-primary flex items-center gap-2 group">
              {userData.name}
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full glass text-text-primary hover:bg-brand-rose hover:text-white transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setActiveTab('Settings')}
            className="p-2 rounded-full glass text-neutral-600 hover:text-brand-rose transition-colors relative cursor-pointer"
            title="Settings"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <div 
            className="p-2 rounded-full glass text-neutral-600 hover:text-brand-rose transition-colors relative cursor-pointer"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="w-5 h-5" />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-rose rounded-full animate-pulse border border-white"></span>
            )}
          </div>
        </div>
      </div>
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      <AnimatePresence>
        {isCameraActive && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-[2rem] aspect-square object-cover mb-8" />
            <div className="flex gap-4">
              <button onClick={stopCamera} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white">
                <X className="w-8 h-8" />
              </button>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-brand-rose flex items-center justify-center text-black border-4 border-white">
                <Camera className="w-8 h-8" />
              </button>
            </div>
            <p className="mt-8 text-white/40 text-xs font-bold uppercase tracking-widest">Selfie Time xxx</p>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const NotificationDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { 
    notifications, 
    hasUnreadNotifications, 
    clearNotifications, 
    markNotificationsAsRead 
  } = useAppContext();

  useEffect(() => {
    if (isOpen && hasUnreadNotifications) {
      markNotificationsAsRead();
    }
  }, [isOpen, hasUnreadNotifications, markNotificationsAsRead]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-brand-bg shadow-2xl z-[101] overflow-y-auto hide-scrollbar"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-serif font-bold text-text-primary">Live Feed</h3>
                <div className="flex items-center gap-3">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] font-bold uppercase tracking-widest text-brand-rose-dark hover:opacity-70 transition-opacity"
                    >
                      Clear All
                    </button>
                  )}
                  <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-text-primary" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {notifications.map(note => (
                  <div key={note.id} className="relative">
                    <div className="flex flex-col mb-1.5 px-1 items-center">
                      <span className="bg-brand-bg px-2 relative z-10 text-[8px] font-black text-neutral-400 uppercase tracking-widest border border-brand-sage/10 rounded-full shadow-sm">
                        {note.timestamp ? new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' }) + ' • ' + new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl glass border-brand-sage/5 hover:border-brand-sage/30 transition-all shadow-sm">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-rose mb-1 opacity-80">{note.title}</p>
                      <p className="text-sm font-medium text-text-primary leading-relaxed whitespace-pre-line tracking-tight">{note.message}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-neutral-400 italic text-sm pt-12">No gossip yet, babe! xxx</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SettingsPage = ({ saveRef }: { saveRef?: React.MutableRefObject<(() => void) | null> }) => {
  const { 
    userData, setUserData, 
    currency, setCurrency, 
    colorGrade, setColorGrade,
    theme, setTheme,
    brokerApiKey, setBrokerApiKey,
    isMockMode, setIsMockMode,
    isPriceAlertsEnabled, setIsPriceAlertsEnabled,
    securitySettings, setSecuritySettings,
    isSettingsDirty, setIsSettingsDirty
  } = useAppContext();
  
  const [subTab, setSubTab] = useState<SettingsSubTab>('main');
  const [passcodeAttempts, setPasscodeAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [showSmsVerification, setShowSmsVerification] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [currentPasscodeInput, setCurrentPasscodeInput] = useState('');

  const [localUser, setLocalUser] = useState(userData);
  const [prefGrade, setPrefGrade] = useState(colorGrade);
  const [localApiKey, setLocalApiKey] = useState(brokerApiKey);
  const [localSecurity, setLocalSecurity] = useState(securitySettings);

  useEffect(() => {
    if (lockoutTime && Date.now() >= lockoutTime) {
      setLockoutTime(null);
      setPasscodeAttempts(0);
    }
  }, [lockoutTime]);

  const handlePasscodeChange = () => {
    if (lockoutTime) return;

    if (currentPasscodeInput !== localSecurity.currentPasscode) {
      const newAttempts = passcodeAttempts + 1;
      setPasscodeAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockoutTime(Date.now() + 30000);
        setShowSmsVerification(true);
      }
      alert(`Incorrect passcode! ${3 - newAttempts} trials remaining, babe. xxx`);
      return;
    }

    if (newPasscode.length !== 4) {
      alert("New passcode must be 4 digits, bestie! 💅");
      return;
    }

    if (newPasscode !== confirmPasscode) {
      alert("Passcodes don't match! Alignment check, please. 🕯️");
      return;
    }

    setLocalSecurity(p => ({ ...p, currentPasscode: newPasscode, passcodeEnabled: true }));
    setNewPasscode('');
    setConfirmPasscode('');
    setCurrentPasscodeInput('');
    setPasscodeAttempts(0);
    alert("Passcode updated! Security is the new black. 🖤");
    setSubTab('main');
  };

  const verifySms = () => {
    if (smsCode === '1234') { // Mock SMS code
      setShowSmsVerification(false);
      setPasscodeAttempts(0);
      setLockoutTime(null);
      alert("Identity confirmed! You're the real one. 💖");
    } else {
      alert("Wrong code! manifesting a retry. 🕯️");
    }
  };

  useEffect(() => {
    setLocalUser(userData);
  }, [userData]);

  useEffect(() => {
    setPrefGrade(colorGrade);
  }, [colorGrade]);

  useEffect(() => {
    setLocalApiKey(brokerApiKey);
  }, [brokerApiKey]);

  useEffect(() => {
    setLocalSecurity(securitySettings);
  }, [securitySettings]);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showApiHelp, setShowApiHelp] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  // Check for unsaved changes
  useEffect(() => {
    const isDirty = 
      JSON.stringify(localUser) !== JSON.stringify(userData) || 
      prefGrade !== colorGrade ||
      localApiKey !== brokerApiKey ||
      JSON.stringify(localSecurity) !== JSON.stringify(securitySettings) ||
      passwords.current !== '' ||
      passwords.new !== '' ||
      passwords.confirm !== '';
    
    // Check if name and email are filled to allow saving
    const isCompulsoryFilled = !!(localUser.name && localUser.email);

    setIsSettingsDirty(isDirty && isCompulsoryFilled);
  }, [localUser, userData, prefGrade, colorGrade, passwords, localApiKey, brokerApiKey, localSecurity, securitySettings, setIsSettingsDirty]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveProfile = () => {
    setUserData(localUser);
    setColorGrade(prefGrade);
    setBrokerApiKey(localApiKey);
    setSecuritySettings(localSecurity);
    setPasswords({ current: '', new: '', confirm: '' });
    setIsSettingsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => {
    if (saveRef) {
      saveRef.current = saveProfile;
    }
    return () => {
      if (saveRef) saveRef.current = null;
    };
  }, [saveRef, localUser, prefGrade]);

  const genderOptions = [
    "Woman", "Man", "non-binary", "agender", "genderfluid", 
    "genderqueer", "two-spirit", "trans woman", "trans man", "prefer not to say"
  ];

  const countryCodes = [
    { code: '+44', country: 'UK' },
    { code: '+1', country: 'US' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+353', country: 'Ireland' },
    { code: '+31', country: 'Netherlands' },
  ];

  return (
    <div className="pt-8 pb-32 px-6 overflow-y-auto h-full hide-scrollbar">
      <div className="flex items-center gap-3 mb-8">
        {subTab !== 'main' && (
          <button 
            onClick={() => setSubTab('main')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
        )}
        <h1 className="text-3xl font-serif font-bold text-text-primary">
          {subTab === 'main' ? 'Settings' : subTab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </h1>
      </div>
      
      <AnimatePresence mode="wait">
        {subTab === 'main' && (
          <motion.div 
            key="main-settings"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
        {/* Profile Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Identity</h3>
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex flex-col items-center gap-4 mb-4">
               <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-rose bg-neutral-100 flex items-center justify-center">
                  {localUser.avatar ? (
                    <img src={localUser.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <DollarSign className="w-8 h-8 text-neutral-300" />
                  )}
               </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Legal Name *</label>
              <input 
                className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium"
                value={localUser.name}
                onChange={e => setLocalUser(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Email Address *</label>
              <input 
                className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium"
                value={localUser.email}
                onChange={e => setLocalUser(p => ({ ...p, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-neutral-400">DDMMYYYY *</label>
                <input 
                  placeholder="12101997"
                  className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium"
                  value={localUser.dob}
                  onChange={e => setLocalUser(p => ({ ...p, dob: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                />
              </div>
              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold uppercase text-neutral-400">Gender *</label>
                <button 
                  onClick={() => setGenderOpen(!genderOpen)}
                  className="w-full text-left bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium flex justify-between items-center"
                >
                  {localUser.gender || 'Select'}
                  <ChevronRight className={`w-3 h-3 transition-transform ${genderOpen ? 'rotate-90' : ''}`} />
                </button>
                {genderOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brand-bg border border-neutral-100 rounded-xl shadow-xl z-50 py-2 max-h-48 overflow-y-auto">
                    {genderOptions.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => {
                          setLocalUser(p => ({ ...p, gender: opt }));
                          setGenderOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors text-text-primary"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Phone Connection *</label>
              <div className="flex gap-2">
                <select 
                  className="bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium text-xs max-w-[80px]"
                  value={localUser.phoneCode}
                  onChange={e => setLocalUser(p => ({ ...p, phoneCode: e.target.value }))}
                >
                  {countryCodes.map(c => <option key={c.code} value={c.code} className="bg-brand-bg text-text-primary">{c.country} ({c.code})</option>)}
                </select>
                <input 
                  placeholder="07123456789"
                  className="flex-1 bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium"
                  value={localUser.phone}
                  onChange={e => setLocalUser(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Security Section (Trading 212 Style) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Privacy & Security</h3>
          <div className="glass rounded-3xl overflow-hidden shadow-sm border border-brand-sage/5">
            <div className="divide-y divide-brand-sage/5">
              <div 
                onClick={() => setSubTab('two-step')}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">Two-step verification</p>
                  <p className="text-[10px] text-neutral-400">Extra layer of security for your account</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${localSecurity.twoStepEnabled ? 'text-green-500' : 'text-neutral-300'}`}>
                     {localSecurity.twoStepEnabled ? 'Active' : 'Off'}
                   </span>
                   <ChevronRight className="w-4 h-4 text-neutral-300" />
                </div>
              </div>

              <div 
                onClick={() => setSubTab('passcode')}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">Passcode lock</p>
                  <p className="text-[10px] text-neutral-400">Lock the app with a secure code</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${localSecurity.passcodeEnabled ? 'text-green-500' : 'text-neutral-300'}`}>
                     {localSecurity.passcodeEnabled ? 'Set' : 'Not Set'}
                   </span>
                   <ChevronRight className="w-4 h-4 text-neutral-300" />
                </div>
              </div>

              <div 
                onClick={() => setSubTab('biometric')}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">Face ID / Touch ID</p>
                  <p className="text-[10px] text-neutral-400">Unlock using biometrics</p>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${localSecurity.biometricEnabled ? 'text-green-500' : 'text-neutral-300'}`}>
                     {localSecurity.biometricEnabled ? 'Active' : 'Off'}
                   </span>
                   <ChevronRight className="w-4 h-4 text-neutral-300" />
                </div>
              </div>

              <div 
                onClick={() => setSubTab('marketing')}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">Marketing Preferences</p>
                  <p className="text-[10px] text-neutral-400">Emails about new manifesting tools</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </div>

              <div 
                onClick={() => setSubTab('data-protection')}
                className="p-5 flex items-center justify-between hover:bg-neutral-50/50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">Data Protection</p>
                  <p className="text-[10px] text-neutral-400">How we store your big energy data</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300" />
              </div>
            </div>
          </div>
        </section>

        {/* Integration Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">System Info</h3>
          </div>
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-sage/10 flex items-center justify-center text-brand-sage">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Portfolio Sync Mode</p>
                <p className="text-[10px] text-neutral-400">Active - CSV Data Source</p>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed italic">
              "CSV Mode is enabled for maximum privacy. Your data stays in your browser session while we fetch live price alignments from the financial ether. 💅✨"
            </p>
          </div>
        </section>

        {/* Security / Password section (Restoring potentially deleted section) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Security Access</h3>
          <div className="glass rounded-3xl p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Change Web Password</label>
              <input 
                type="password"
                placeholder="Current Password"
                className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium placeholder:text-neutral-300"
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="password"
                placeholder="New Password"
                className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium placeholder:text-neutral-300"
                value={passwords.new}
                onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
              />
              <input 
                type="password"
                placeholder="Confirm New"
                className="w-full bg-transparent border-b border-brand-sage/10 py-1 outline-none text-text-primary font-medium placeholder:text-neutral-300"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            <p className="text-[9px] text-neutral-300 italic">Changing this only affects your local session security, babe. xxx</p>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Vibe Customisation</h3>
          <div className="glass rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Dark Mode</label>
              <div 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-black' : 'bg-neutral-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Price Alerts</label>
              <div 
                onClick={() => setIsPriceAlertsEnabled(!isPriceAlertsEnabled)}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${isPriceAlertsEnabled ? 'bg-black' : 'bg-neutral-200'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isPriceAlertsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Currency Preference</label>
              <div className="flex gap-2">
                {(['GBP', 'USD', 'EUR'] as Currency[]).map(curr => (
                  <button 
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${currency === curr ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase text-neutral-400">Colour Grade (Previewing)</label>
              <div className="grid grid-cols-2 gap-2">
                {(['default', 'champagne', 'espresso', 'lavender', 'silver'] as ColorGrade[]).map(grade => (
                  <button 
                    key={grade}
                    onClick={() => {
                        setPrefGrade(grade);
                        document.documentElement.setAttribute('data-grade', grade);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize ${prefGrade === grade ? 'bg-brand-rose text-white' : 'bg-neutral-100 text-neutral-400'}`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        
            <div className="space-y-3 pt-4">
              {saveSuccess && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs font-bold text-green-500 uppercase tracking-widest"
                >
                  Profile secured, bestie! 💅
                </motion.p>
              )}
              <button 
                onClick={saveProfile}
                disabled={!isSettingsDirty}
                className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${isSettingsDirty ? 'bg-black text-white hover:translate-y-[-2px]' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        )}

        {subTab === 'passcode' && (
          <motion.div 
            key="passcode-sub"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-6 space-y-6">
              {showSmsVerification ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase">SMS Verification Required</h4>
                  <p className="text-xs text-neutral-500">We've sent a code to {localUser.phoneCode} {localUser.phone}. Confirm it's you, queen. 🕯️</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400">Enter Code (Try 1234)</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      className="w-full bg-transparent border-b border-brand-sage/10 py-2 outline-none text-xl tracking-[1em] text-center"
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button 
                    onClick={verifySms}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold uppercase text-xs"
                  >
                    Verify Identity
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Current Passcode</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-full bg-transparent border-b border-brand-sage/10 py-2 outline-none text-xl tracking-[1em]"
                      value={currentPasscodeInput}
                      onChange={e => setCurrentPasscodeInput(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">New 4-Digit Passcode</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-full bg-transparent border-b border-brand-sage/10 py-2 outline-none text-xl tracking-[1em]"
                      value={newPasscode}
                      onChange={e => setNewPasscode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Confirm New Passcode</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="••••"
                      className="w-full bg-transparent border-b border-brand-sage/10 py-2 outline-none text-xl tracking-[1em]"
                      value={confirmPasscode}
                      onChange={e => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  {lockoutTime && (
                    <p className="text-xs text-red-500 font-bold text-center">
                      Locked out! Try again in {Math.ceil((lockoutTime - Date.now())/1000)}s
                    </p>
                  )}

                  <button 
                    onClick={handlePasscodeChange}
                    disabled={!!lockoutTime}
                    className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${lockoutTime ? 'bg-neutral-200 text-neutral-400' : 'bg-black text-white'}`}
                  >
                    Update Passcode
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 text-center px-6 leading-relaxed italic">
              Security is an alignment choice, babe. Keep your code private like your manifestation journal. 🕯️✨
            </p>
          </motion.div>
        )}

        {subTab === 'two-step' && (
          <motion.div 
            key="2fa-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Two-step verification</h4>
                  <p className="text-xs text-neutral-400">Secure your bag with a code</p>
                </div>
                <div 
                  onClick={() => setLocalSecurity(p => ({ ...p, twoStepEnabled: !p.twoStepEnabled }))}
                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${localSecurity.twoStepEnabled ? 'bg-black' : 'bg-neutral-200'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSecurity.twoStepEnabled ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {subTab === 'biometric' && (
          <motion.div 
            key="bio-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Face ID / Touch ID</h4>
                  <p className="text-xs text-neutral-400">Unlock using biometrics</p>
                </div>
                <div 
                  onClick={() => setLocalSecurity(p => ({ ...p, biometricEnabled: !p.biometricEnabled }))}
                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${localSecurity.biometricEnabled ? 'bg-black' : 'bg-neutral-200'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSecurity.biometricEnabled ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {subTab === 'marketing' && (
          <motion.div 
            key="marketing-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Marketing Preferences</h4>
                  <p className="text-xs text-neutral-400">Emails about new manifesting tools</p>
                </div>
                <div 
                  onClick={() => setLocalSecurity(p => ({ ...p, marketingPrefs: !p.marketingPrefs }))}
                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${localSecurity.marketingPrefs ? 'bg-black' : 'bg-neutral-200'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSecurity.marketingPrefs ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {subTab === 'data-protection' && (
          <motion.div 
            key="data-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="glass rounded-3xl p-6 space-y-4">
              <h4 className="font-semibold">Data Protection</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                We store your data as carefully as you store your luxury bags, babe. Not Financial Advice, just digital vault energy.  Vaulted, encrypted, and serving privacy. 💅✨
              </p>
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs font-semibold">Strict Encryption</span>
                <div 
                  onClick={() => setLocalSecurity(p => ({ ...p, dataProtection: !p.dataProtection }))}
                  className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${localSecurity.dataProtection ? 'bg-black' : 'bg-neutral-200'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${localSecurity.dataProtection ? 'translate-x-5' : ''}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApiHelp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-brand-bg rounded-3xl p-8 border-2 border-brand-sage max-w-sm w-full shadow-2xl relative"
            >
               <button onClick={() => setShowApiHelp(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-text-primary">
                <X className="w-5 h-5" />
               </button>
               <h3 className="text-xl font-serif text-text-primary mb-4">What's an API, babe?</h3>
               <p className="text-sm text-neutral-600 leading-relaxed italic">
                 "Think of an API as like a secret handshake between the terminal and your broker. 
                 She tells us how much money you’re manifesting in real-time so we can stay on 
                 top of the vibes together! xxx"
               </p>
               <button 
                onClick={() => setShowApiHelp(false)}
                className="mt-6 w-full py-3 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest"
               >
                 Got it!
               </button>
            </motion.div>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" onClick={() => setShowApiHelp(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WalletCentre = () => {
  const { 
    stocks = [], 
    currency = 'GBP', 
    totalBalance = 0, 
    totalProfit = 0, 
    accountType, 
    isRefreshing, 
    lastSyncError,
    lastUpdated,
    handleCsvUpload,
    refreshPrices,
    resetPortfolio
  } = useAppContext();
  
  // Ensure we have valid numbers
  const safeBalance = typeof totalBalance === 'number' && !isNaN(totalBalance) ? totalBalance : 0;
  const safeProfit = typeof totalProfit === 'number' && !isNaN(totalProfit) ? totalProfit : 0;
  
  const totalValue = safeBalance;
  const totalInvested = stocks.reduce((acc, s) => acc + (s.quantity * (s.avgBuyPrice || 0)), 0);
  const totalDividends = stocks.reduce((acc, s) => acc + (s.dividends || 0), 0);
  const totalResult = safeProfit + totalDividends;
  const dailyGain = stocks.reduce((acc, s) => acc + (Number(s?.dailyMove) || 0), 0);
  
  // Historical data simulation
  const historicalData = useMemo(() => {
    try {
      const points = 20;
      const data = [];
      const base = totalValue - safeProfit;
      for (let i = 0; i < points; i++) {
          const progress = i / (points - 1);
          const randomFactor = 1 + (Math.random() - 0.5) * 0.05;
          const trend = base + (safeProfit * progress);
          data.push({
              name: i,
              value: Number((trend * randomFactor).toFixed(2)) || 0
          });
      }
      return data;
    } catch (e) {
      return Array(20).fill(0).map((_, i) => ({ name: i, value: 0 }));
    }
  }, [totalValue, safeProfit]);

  return (
    <div className="pt-8 pb-32">
      <div className="px-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-text-primary mb-1">Portfolio Centre</h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Smart Tracking Hub</p>
          {lastUpdated && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-sage/10 border border-brand-sage/20 text-[10px] font-bold text-brand-sage uppercase tracking-tighter">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Last Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {lastSyncError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 mb-6"
          >
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                {lastSyncError}
              </p>
              <button onClick={() => resetPortfolio()} className="ml-auto text-[10px] font-bold underline">Retry</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!stocks.length ? (
        <CsvUploadZone handleUpload={handleCsvUpload} isRefreshing={isRefreshing} />
      ) : (
        <>
          <div className="px-6 mb-8">
            <div className="bg-brand-sage text-brand-bg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-brand-sage/20">
              <div className="absolute top-[-20%] right-[-10%] opacity-10 blur-xl group-hover:opacity-20 transition-opacity">
                <div className="w-48 h-48 bg-white rounded-full" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-black/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-black/50">
                    Portfolio Real-Time NAV
                  </span>
                  <button 
                    onClick={() => refreshPrices()}
                    disabled={isRefreshing}
                    className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-1 mb-8">
                   <h2 className="text-6xl font-serif font-bold tracking-tighter drop-shadow-sm">
                     <AnimatedPrice value={totalValue} currency={currency} />
                   </h2>
                   <div className="flex flex-wrap items-center gap-3 mt-4">
                     <FlashUpdate value={totalResult} isPositive={totalResult >= 0}>
                        <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg backdrop-blur-xl ${totalResult >= 0 ? 'bg-white text-brand-sage' : 'bg-red-500 text-white'}`}>
                          {totalResult >= 0 ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {formatCurrency(Math.abs(totalResult), currency)} Result
                        </div>
                     </FlashUpdate>
                     
                     <div className="px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg backdrop-blur-xl bg-black/20 text-white border border-white/10">
                       <Wallet className="w-3 h-3" />
                       Invested: {formatCurrency(totalInvested, currency)}
                     </div>

                     {totalDividends > 0 && (
                       <div className="px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg backdrop-blur-xl bg-brand-rose text-white border border-white/10 animate-pulse">
                         <TrendingUp className="w-3 h-3" />
                         Dividends: {formatCurrency(totalDividends, currency)}
                       </div>
                     )}

                     <div className="text-[10px] font-bold text-white/40 tracking-wider">
                       My Portfolio ✨
                     </div>
                   </div>
                </div>

                <div className="h-32 -mx-10 -mb-10 mt-8 overflow-hidden opacity-40 group-hover:opacity-80 transition-all duration-700">
                  <PortfolioGraph data={historicalData} color="#fff" height={130} />
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button 
                onClick={resetPortfolio}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 hover:text-brand-rose transition-colors flex items-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-brand-rose/10 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </div>
                Reset Portfolio Data
              </button>
            </div>
          </div>

          <PortfolioInsights />

          <div className="px-6 space-y-6 pb-12">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Your Assets</h4>
              <p className="text-[10px] text-neutral-400 font-bold italic">Sorted by Performance</p>
            </div>
            {stocks.sort((a,b) => b.change - a.change).map((stock, idx) => {
              const allocation = totalValue > 0 ? (stock.totalValue / totalValue) * 100 : 0;
              const invested = stock.quantity * stock.avgBuyPrice;
              return (
                <motion.div 
                  key={stock.ticker}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass rounded-[2rem] p-5 sm:p-7 border-neutral-100 group hover:border-brand-sage/40 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-serif font-black text-lg sm:text-xl shadow-inner bg-brand-sage/10 text-brand-sage">
                        {stock.ticker.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col mb-1">
                           <h4 className="font-serif font-bold text-text-primary text-sm sm:text-base tracking-tight truncate leading-tight">
                             {stock.name || stock.ticker}
                           </h4>
                           <div className="flex items-center gap-1.5">
                             <span className="text-[10px] font-black text-neutral-400 tracking-widest">{stock.ticker}</span>
                           </div>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 overflow-hidden">
                             <p className="text-[8px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-tight opacity-70">
                               {stock.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} Units
                             </p>
                             <div className="w-0.5 h-0.5 rounded-full bg-neutral-200 hidden xs:block" />
                             <p className="text-[8px] sm:text-[9px] text-neutral-400 font-bold uppercase tracking-tight opacity-70">
                               Buy: {formatCurrency(stock.avgBuyPrice || 0, currency)}
                             </p>
                             <div className="w-0.5 h-0.5 rounded-full bg-neutral-200 hidden sm:block" />
                             <p className="text-[8px] sm:text-[9px] text-brand-sage font-black uppercase tracking-tight">
                               Price: {formatCurrency(stock.price, currency)}
                             </p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[6px] sm:text-[8px] text-neutral-400 font-black uppercase tracking-widest opacity-40 leading-none mb-0.5 sm:mb-1">Total GBP Invested</span>
                            <p className="text-xs sm:text-sm text-brand-sage-dark font-black tracking-tighter">
                              {formatCurrency(invested, currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:gap-3 text-right">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden md:block">
                          <StockSparkline change={stock.change} />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[6px] sm:text-[8px] text-neutral-400 font-black uppercase tracking-widest opacity-40 leading-none mb-0.5 sm:mb-1">Market Value</span>
                           <p className="font-serif font-bold text-lg sm:text-2xl text-text-primary mb-0.5 sm:mb-1 tracking-tighter leading-none">
                            <AnimatedPrice value={stock.totalValue} currency={currency} />
                          </p>
                          <FlashUpdate value={stock.change} isPositive={stock.change >= 0}>
                            <div className={`inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[7px] sm:text-[10px] font-black tracking-widest uppercase ${stock.change >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                              {stock.change >= 0 ? <ArrowUpRight className="w-2 h-2 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2 h-2 sm:w-3 sm:h-3" />}
                              {Math.abs(stock.change).toFixed(2)}%
                            </div>
                          </FlashUpdate>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[6px] sm:text-[8px] text-neutral-400 font-black uppercase tracking-widest opacity-40 mb-0.5 sm:mb-1 leading-none">{stock.change >= 0 ? 'Total Profit' : 'Total Loss'}</span>
                        <p className={`text-[9px] sm:text-xs font-black uppercase tracking-tight whitespace-nowrap ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(Math.abs(stock.totalValue - invested + (stock.dividends || 0)), currency)}
                        </p>
                        {stock.dividends! > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[6px] text-brand-rose font-black uppercase tracking-tighter">Dividends:</span>
                            <span className="text-[8px] text-brand-rose font-bold">{formatCurrency(stock.dividends!, currency)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Allocation Bar */}
                  <div className="mt-6 pt-5 border-t border-brand-sage/5">
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full animate-pulse ${stock.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                         <p className="text-[11px] text-neutral-500 font-medium italic leading-relaxed">"{stock.narrative}"</p>
                       </div>
                       <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{allocation.toFixed(1)}% PORTFOLIO</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${allocation}%` }}
                        className={`h-full rounded-full ${stock.change >= 0 ? 'bg-brand-sage' : 'bg-brand-rose'}`} 
                       />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


const CsvUploadZone = ({ handleUpload, isRefreshing }: { handleUpload: (file: File) => Promise<void>, isRefreshing: boolean }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
      handleUpload(file);
    } else {
      alert("Bestie, we need a CSV file! xxx");
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="px-6">
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative glass rounded-[2.5rem] p-12 border-2 border-dashed transition-all flex flex-col items-center text-center ${
          isDragging ? 'border-brand-rose bg-brand-rose/5 scale-[0.98]' : 'border-neutral-200'
        }`}
      >
        {isRefreshing ? (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-brand-rose/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
               <RefreshCw className="w-10 h-10 text-brand-rose animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-text-primary mb-2">Analyzing Portfolio...</h3>
              <p className="text-xs text-neutral-400 italic">"Fetching live pricing. Manifesting green candles for you bestie! xxx"</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-xl font-serif font-bold text-text-primary mb-2 uppercase tracking-wide">Import Portfolio</h3>
            <p className="text-sm text-neutral-500 mb-8 max-w-[280px] leading-relaxed italic">
              "Upload your CSV export from <span className="text-brand-rose font-bold">Trading 212</span> or any broker. We'll handle the rest! 💅🕯️"
            </p>
            
            <label className="bg-black text-white px-10 py-4 rounded-3xl font-bold uppercase text-xs tracking-widest cursor-pointer hover:bg-neutral-800 transition-all shadow-xl active:scale-95">
              Select CSV File
              <input type="file" className="hidden" accept=".csv" onChange={onFileSelect} />
            </label>
            
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
               <div className="p-3 bg-neutral-50 rounded-2xl flex flex-col items-center">
                 <ShieldCheck className="w-4 h-4 text-brand-sage mb-1" />
                 <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Safe Sync</span>
               </div>
               <div className="p-3 bg-neutral-50 rounded-2xl flex flex-col items-center">
                 <Zap className="w-4 h-4 text-brand-rose mb-1" />
                 <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">Live Pricing</span>
               </div>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 p-6 glass rounded-3xl border-brand-sage/5">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">CSV Requirements</h4>
        <div className="space-y-4">
           <div className="flex gap-3">
             <div className="w-5 h-5 rounded-full bg-brand-sage/10 flex items-center justify-center text-brand-sage shrink-0">
               <CheckCircle2 className="w-3 h-3" />
             </div>
             <p className="text-[11px] text-neutral-600 leading-tight">Must include columns for <span className="font-bold">Ticker/Instrument</span> and <span className="font-bold">Quantity</span>.</p>
           </div>
           <div className="flex gap-3">
             <div className="w-5 h-5 rounded-full bg-brand-sage/10 flex items-center justify-center text-brand-sage shrink-0">
               <CheckCircle2 className="w-3 h-3" />
             </div>
             <p className="text-[11px] text-neutral-600 leading-tight">Optional: <span className="font-bold">Avg Price</span> and <span className="font-bold">Dividends</span> for full tracking hub details. ✨</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioInsights = () => {
    const { stocks = [], totalBalance = 0, totalResult = 0, currency = 'GBP', aiInsights, isGeneratingInsights } = useAppContext();

    if (!stocks || stocks.length === 0) return null;

    // Helper to extract parts of the AI response
    const parseInsights = (text: string | null) => {
        if (!text) return null;
        
        const sections: Record<string, string[]> = {
            'Snapshot': [],
            'Winners': [],
            'Risk': [],
            'Suggestions': []
        };

        const lines = text.split('\n');
        let currentSection = '';

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            if (trimmed.includes('Portfolio Snapshot')) currentSection = 'Snapshot';
            else if (trimmed.includes('Winners & Losers')) currentSection = 'Winners';
            else if (trimmed.includes('Risk Overview')) currentSection = 'Risk';
            else if (trimmed.includes('Suggestions')) currentSection = 'Suggestions';
            else if (currentSection) {
                sections[currentSection].push(trimmed.replace(/^[-*•]\s+/, ''));
            }
        });

        return sections;
    };

    const sections = parseInsights(aiInsights);

    return (
        <div className="px-6 mb-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${isGeneratingInsights ? 'animate-pulse text-brand-rose' : 'text-brand-rose'}`} />
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Financial Insights</h4>
                </div>
                {isGeneratingInsights && (
                    <span className="text-[9px] font-bold text-brand-rose uppercase animate-pulse">Analysing...</span>
                )}
            </div>

            {aiInsights ? (
                <>
                    {/* Snapshot */}
                    <div className="glass rounded-[2rem] p-6 border-white/40 shadow-sm transition-all duration-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-brand-sage/10 text-brand-sage">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Alignment Snapshot</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-text-primary/80 leading-relaxed italic">
                            "{sections?.['Snapshot']?.[0] || "Your portfolio is catching a vibe. Analysis pending..."}"
                        </p>
                    </div>

                    {/* Winners & Losers */}
                    <div className="glass rounded-[2rem] p-6 border-white/40 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-brand-rose/10 text-brand-rose">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Top Entities</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {sections?.['Winners']?.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-rose mt-1 shrink-0" />
                                    <p className="text-[11px] text-text-primary/70 leading-relaxed font-bold italic">{item}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Risk Overview */}
                    <div className="glass rounded-[2rem] p-6 border-white/40 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-500">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Risk Analysis</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {sections?.['Risk']?.map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-brand-sage mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-text-primary/70 leading-relaxed font-bold italic">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="px-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
                            <Award className="w-3 h-3" />
                            Bespoke Suggestions
                        </h5>
                        <div className="grid grid-cols-1 gap-3">
                            {sections?.['Suggestions']?.map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-brand-sage/10 bg-white shadow-sm flex gap-3 items-start">
                                    <div className="w-6 h-6 rounded-lg bg-brand-sage/10 flex items-center justify-center text-brand-sage shrink-0 mt-0.5">
                                        <Zap className="w-3 h-3" />
                                    </div>
                                    <p className="text-[11px] text-text-primary/70 leading-relaxed font-bold italic">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass rounded-[2rem] p-8 border-white/40 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                        <RefreshCw className={`w-6 h-6 text-neutral-300 ${isGeneratingInsights ? 'animate-spin' : ''}`} />
                    </div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        {isGeneratingInsights ? "Consulting the stars..." : "No insights manifested yet"}
                    </p>
                </div>
            )}
        </div>
    );
};


const GoalsProgress = () => {
  const { goalData, setGoalData, totalBalance, currency } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(goalData);

  const progress = Math.min(Math.round((totalBalance / goalData.target) * 100), 100);

  const handleSave = () => {
    setGoalData(tempGoal);
    setIsEditing(false);
  };

  const [quoteIdx, setQuoteIdx] = useState(0);
  const quotes = [
    "Wealth is a tool for the lifestyle I deserve.",
    "Main character energy requires a main character portfolio.",
    "Manifesting my dream life, one trade at a time.",
    "Financial freedom is the ultimate luxury, babe.",
    "Serving gains and looking good while doing it. ✨"
  ];

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * quotes.length));
  }, []);

  return (
    <div className="px-6 mb-8">
      <div 
        onClick={() => !isEditing && setIsEditing(true)}
        className="glass rounded-3xl p-6 shadow-sm border-white/40 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <div className="w-full mr-4 space-y-2" onClick={(e) => e.stopPropagation()}>
              <input 
                className="w-full text-sm font-medium bg-transparent border-b border-brand-sage/20 outline-none text-text-primary"
                placeholder="Goal Destination"
                value={tempGoal.name}
                onChange={(e) => setTempGoal(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="flex items-center gap-1">
                <span className="text-text-primary">{currencySymbols[currency]}</span>
                <input 
                  type="number"
                  className="w-full text-2xl font-serif font-semibold bg-transparent border-b border-brand-sage/20 outline-none text-text-primary"
                  placeholder="Target Amount"
                  value={tempGoal.target}
                  onChange={(e) => setTempGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
                />
              </div>
              <button 
                onClick={handleSave}
                className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-rose-dark"
              >
                Save Goal
              </button>
            </div>
          ) : (
            <div>
              <p className="text-text-primary/60 text-sm font-medium mb-1">Goals Progress</p>
              <h3 className="text-3xl font-serif text-text-primary tracking-tight">
                {progress}% <span className="text-lg font-sans font-normal text-neutral-400">to {goalData.name}</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">Target: {formatCurrency(goalData.target, currency)}</p>
            </div>
          )}
          <Target className="w-8 h-8 text-text-primary opacity-50 flex-shrink-0" />
        </div>
        <div className="w-full bg-neutral-100/50 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-brand-sage shadow-[0_0_10px_rgba(0,0,0,0.2)]"
          />
        </div>
        <p className="mt-3 text-xs text-text-primary/60 italic font-medium">"{quotes[quoteIdx]}"</p>
      </div>
    </div>
  );
};


const WishlistTicker = () => {
  const { wishlistItems, currency } = useAppContext();

  return (
    <div className="mb-8 overflow-hidden">
      <div className="px-6 mb-3 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-neutral-400" />
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Wishlist</h4>
      </div>
      <div className="flex relative">
        <motion.div 
          className="flex gap-4 px-6 shrink-0"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...wishlistItems, ...wishlistItems].map((goal, idx) => (
            <div key={idx} className="glass py-2 px-4 rounded-full flex items-center gap-2 border-white/50 shadow-sm whitespace-nowrap">
              <span className="text-sm">{goal.icon}</span>
              <span className="text-sm font-medium text-text-primary">{goal.name}</span>
              <span className="text-sm font-serif italic text-brand-rose-dark font-bold">{formatCurrency(goal.amount, currency)}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

import { Reorder } from 'motion/react';

const LiveMarketTicker = () => {
    const { stocks = [], currency = 'GBP' } = useAppContext();
    if (stocks.length === 0) return null;

    return (
        <div className="bg-black/5 py-4 border-y border-brand-sage/10 overflow-hidden relative mb-6">
            <motion.div 
                className="flex whitespace-nowrap gap-16 items-center"
                animate={{ x: [0, -2000] }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            >
                {[...Array(10)].map((_, i) => (
                    <React.Fragment key={i}>
                        {stocks.map(s => (
                            <div key={`${s.ticker}-${i}`} className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{s.ticker}</span>
                                    <span className="text-xs font-mono font-bold text-brand-sage">{formatCurrency(s.price, currency)}</span>
                                </div>
                                <div className="w-12 h-6 opacity-60">
                                    <StockSparkline change={s.change} />
                                </div>
                                <div className={`flex items-center text-[10px] font-bold ${s.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {s.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(s.change).toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
};

const ActiveTrades = () => {
  const { stocks = [], setStocks, vibeCheckStock, currency = 'GBP' } = useAppContext();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const totals = useMemo(() => {
    return stocks.reduce((acc, s) => ({
      invested: acc.invested + (s.investedValue || 0),
      current: acc.current + (s.totalValue || 0),
      result: acc.result + (s.result || 0),
      dividends: acc.dividends + (s.dividendsGained || 0),
      divCash: acc.divCash + (s.dividendsCash || 0),
      divRein: acc.divRein + (s.dividendsReinvested || 0),
    }), { invested: 0, current: 0, result: 0, dividends: 0, divCash: 0, divRein: 0 });
  }, [stocks]);

  return (
    <div className="px-6 mb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif text-shadow-sm">Full Portfolio</h3>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
            {stocks.length} assets identified xxx
          </p>
        </div>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-brand-rose' : 'text-neutral-400'}`}
          >
            <Briefcase className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-brand-rose' : 'text-neutral-400'}`}
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PortfolioInsights />

      {stocks.length === 0 ? (
        <div className="glass rounded-2xl p-12 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center opacity-40">
          <Search className="w-8 h-8 mb-3" />
          <p className="text-xs font-medium">Scanning for active vibes... No positions found yet. xxx</p>
        </div>
      ) : viewMode === 'cards' ? (
        <Reorder.Group axis="y" values={stocks} onReorder={setStocks} className="grid grid-cols-1 gap-4">
          {stocks.map((stock) => (
            <Reorder.Item 
              key={stock.ticker} 
              value={stock}
              className="glass rounded-[2rem] p-6 flex flex-col items-center border-neutral-100 hover:border-brand-sage transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
            >
              <div className="w-full flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl bg-black text-white shadow-md">
                    {stock.ticker.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-lg font-serif font-bold tracking-tight text-text-primary leading-none">{stock.name}</h4>
                      {stock.slice && (
                        <span className="px-2 py-0.5 rounded-lg bg-brand-sage/10 text-[9px] font-black uppercase text-brand-sage tracking-widest leading-none">
                          {stock.slice}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stock.ticker}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Performance</div>
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${stock.change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {stock.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {Math.abs(stock.change).toFixed(2)}%
                   </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 w-full p-5 rounded-3xl bg-neutral-50/50 mb-6">
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Invested Value</p>
                  <p className="text-sm font-bold text-text-primary">{formatCurrency(stock.investedValue || 0, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Market Value</p>
                  <p className="text-sm font-bold text-text-primary">{formatCurrency(stock.totalValue || 0, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Result</p>
                  <p className={`text-sm font-bold ${(stock.result || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(stock.result || 0, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Owned Quantity</p>
                  <p className="text-sm font-bold text-text-primary">{stock.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} units</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Div. Gained</p>
                  <p className="text-sm font-bold text-brand-sage">{formatCurrency(stock.dividendsGained || 0, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Div. Cash</p>
                  <p className="text-sm font-bold text-neutral-500">{formatCurrency(stock.dividendsCash || 0, currency)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mb-1">Div. Reinvested</p>
                  <p className="text-sm font-bold text-neutral-500">{formatCurrency(stock.dividendsReinvested || 0, currency)}</p>
                </div>
              </div>

              {/* Narrative */}
              <div className="w-full flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm italic">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${(stock.result || 0) >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {(stock.result || 0) >= 0 ? <Activity className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <p className="text-[10px] text-text-primary/70 font-medium leading-relaxed">
                  {stock.narrative || "Portfolio alignment in progress. Manifesting growth. xxx"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    vibeCheckStock(stock.ticker);
                  }}
                  className="p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-neutral-100 shadow-sm text-brand-rose h-10 w-10 flex items-center justify-center hover:bg-brand-rose hover:text-white transition-all active:scale-95"
                  title="Vibe Check"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setStocks(prev => prev.filter(s => s.ticker !== stock.ticker));
                  }}
                  className="p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-neutral-100 shadow-sm text-neutral-300 h-10 w-10 flex items-center justify-center hover:text-brand-rose hover:border-brand-rose transition-all active:scale-95"
                  title="Remove Stock"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6 pb-4">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-neutral-100/50">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">Slice</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Invested value</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Value</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Result</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Owned quantity</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Dividends gained</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Dividends cash</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Dividends reinvested</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {stocks.map((stock) => (
                <tr key={stock.ticker} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-4 py-3 text-xs font-medium text-neutral-400 capitalize">{stock.slice || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">{stock.ticker}</span>
                      <span className="text-[10px] text-neutral-400 truncate max-w-[150px]">{stock.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">{formatCurrency(stock.investedValue || 0, currency)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right">{formatCurrency(stock.totalValue || 0, currency)}</td>
                  <td className={`px-4 py-3 text-sm font-bold text-right ${(stock.result || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(stock.result || 0, currency)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">{stock.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-brand-sage">{formatCurrency(stock.dividendsGained || 0, currency)}</td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-500">{formatCurrency(stock.dividendsCash || 0, currency)}</td>
                  <td className="px-4 py-3 text-sm text-right text-neutral-500">{formatCurrency(stock.dividendsReinvested || 0, currency)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          vibeCheckStock(stock.ticker);
                        }}
                        className="p-2 rounded-lg bg-brand-rose/5 text-brand-rose hover:bg-brand-rose hover:text-white transition-all"
                        title="Vibe Check"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setStocks(prev => prev.filter(s => s.ticker !== stock.ticker));
                        }}
                        className="p-2 rounded-lg text-neutral-300 hover:text-brand-rose transition-all"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 font-bold">
                <td colSpan={2} className="px-4 py-4 text-xs uppercase tracking-widest text-neutral-400">Totals</td>
                <td className="px-4 py-4 text-sm text-right">{formatCurrency(totals.invested, currency)}</td>
                <td className="px-4 py-4 text-sm text-right">{formatCurrency(totals.current, currency)}</td>
                <td className={`px-4 py-4 text-sm text-right ${totals.result >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(totals.result, currency)}
                </td>
                <td className="px-4 py-4 text-sm"></td>
                <td className="px-4 py-4 text-sm text-right text-brand-sage">{formatCurrency(totals.dividends, currency)}</td>
                <td className="px-4 py-4 text-sm text-right text-neutral-500">{formatCurrency(totals.divCash, currency)}</td>
                <td className="px-4 py-4 text-sm text-right text-neutral-500">{formatCurrency(totals.divRein, currency)}</td>
                <td className="px-4 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

const IncomeTracker = () => {
  const { totalBalance, totalProfit, totalResult, totalDividends, stocks, currency, brokerApiKey, isRefreshing } = useAppContext();

  // Mock historical data for terminal overview
  const historicalData = useMemo(() => {
    const points = 15;
    const data = [];
    const base = totalBalance - totalProfit;
    for (let i = 0; i < points; i++) {
        const progress = i / (points - 1);
        const rand = (Math.random() - 0.5) * 0.02;
        const trend = base + (totalProfit * progress);
        data.push({ value: Number((trend * (1 + rand)).toFixed(2)) });
    }
    return data;
  }, [totalBalance, totalProfit]);

  return (
    <div className="px-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif">Net Worth Details</h3>
        <Briefcase className="w-4 h-4 text-neutral-400" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 border-neutral-100 relative overflow-hidden group h-full">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-brand-sage text-brand-bg flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Portfolio NAV</span>
            </div>
            <p className="text-sm text-neutral-400 font-medium">Market Value</p>
            <h4 className="text-2xl font-serif font-bold text-text-primary mb-1">{formatCurrency(totalBalance, currency)}</h4>
            <div className={`text-[10px] font-black uppercase tracking-widest ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit, currency)} Unrealised
            </div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 h-12 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
            <PortfolioGraph data={historicalData} color={totalProfit >= 0 ? "#10b981" : "#ef4444"} height={48} />
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border-neutral-100 relative overflow-hidden group h-full bg-neutral-900 text-white border-none shadow-xl">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-brand-rose text-white flex items-center justify-center">
                 <ShieldCheck className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Total Result</span>
             </div>
             <p className="text-sm text-white/60 font-medium">Capital + Dividends</p>
             <h4 className="text-2xl font-serif font-bold text-white mb-1">
               {totalResult >= 0 ? '+' : ''}{formatCurrency(totalResult, currency)}
             </h4>
             <div className="flex items-center gap-2 mt-2">
               <div className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black uppercase tracking-tighter">
                 {formatCurrency(totalDividends, currency)} Dividends
               </div>
               <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${totalResult >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                 {((totalResult / (totalBalance - totalProfit || 1)) * 100).toFixed(1)}% Yield
               </div>
             </div>
           </div>
        </div>
      </div>
      
      <div className="mt-4 glass rounded-2xl p-4 border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalProfit >= 0 ? 'bg-brand-sage text-brand-bg' : 'bg-brand-rose text-brand-bg'}`}>
              {totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold font-sans flex items-center gap-2">
                Performance Vibe
                {isRefreshing && (
                  <span className="flex items-center gap-1 text-[8px] text-brand-sage animate-pulse">
                    <RefreshCw className="w-2 h-2 animate-spin" />
                    UPDATING
                  </span>
                )}
              </p>
              <h4 className="text-sm font-medium italic">
                {totalProfit >= 0 
                  ? "Serving main character gains 💅🥂" 
                  : "Checking our alignment. She's just catching her breath for the next moon shot. ✨🕯️"}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <span className={`font-serif text-xl font-bold ${totalProfit >= 0 ? '' : 'text-brand-rose'}`}>
              {totalProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalProfit), currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const { wishlistItems, setWishlistItems, totalProfit, currency } = useAppContext();
  const [newItem, setNewItem] = useState({ name: '', amount: 0, icon: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [tempEdit, setTempEdit] = useState<Goal | null>(null);

  const addItem = () => {
    if (newItem.name && newItem.amount > 0) {
      setWishlistItems(prev => [...prev, { icon: newItem.icon || '✨', name: newItem.name, amount: newItem.amount }]);
      setNewItem({ name: '', amount: 0, icon: '' });
      setIsAdding(false);
    }
  };

  const removeItem = (idx: number) => {
    setWishlistItems(prev => prev.filter((_, i) => i !== idx));
  };

  const startEditing = (idx: number, item: Goal) => {
    setEditingIdx(idx);
    setTempEdit(item);
  };

  const saveEdit = () => {
    if (editingIdx !== null && tempEdit) {
      setWishlistItems(prev => {
        const newItems = [...prev];
        newItems[editingIdx] = tempEdit;
        return newItems;
      });
      setEditingIdx(null);
      setTempEdit(null);
    }
  };

  return (
    <div className="pt-8 pb-32">
      <div className="px-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-text-primary">Wishlist</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-full border-2 border-brand-sage flex items-center justify-center text-text-primary hover:bg-brand-sage hover:text-brand-bg transition-all shadow-sm"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 space-y-4">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-bg rounded-3xl p-6 border-2 border-brand-sage shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  className="w-16 bg-transparent border-b border-brand-sage outline-none p-2 text-text-primary text-2xl text-center"
                  placeholder="✨"
                  value={newItem.icon}
                  onChange={(e) => setNewItem(prev => ({ ...prev, icon: e.target.value }))}
                />
                <input 
                  className="flex-1 bg-transparent border-b border-brand-sage outline-none p-2 text-text-primary font-serif placeholder:italic"
                  placeholder="Item Name (e.g., Pink Pilates Mat)"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <input 
                type="number"
                className="w-full bg-transparent border-b border-brand-sage outline-none p-2 text-text-primary font-serif placeholder:italic"
                placeholder={`Amount (${currencySymbols[currency]})`}
                value={newItem.amount || ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
              <div className="flex gap-2 pt-2">
                <button onClick={addItem} className="flex-1 py-3 bg-brand-sage text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest">Add to Life</button>
                <button onClick={() => setIsAdding(false)} className="px-6 py-3 border-2 border-brand-sage rounded-xl text-xs font-bold uppercase tracking-widest text-text-primary">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {wishlistItems.map((item, idx) => {
          const coverage = Math.min(Math.round((totalProfit / item.amount) * 100), 100);
          const isFunded = totalProfit >= item.amount;
          const isEditingItem = editingIdx === idx;

          return (
            <div 
              key={idx} 
              className="bg-brand-bg rounded-3xl p-6 border border-neutral-100 shadow-sm group hover:border-brand-rose transition-colors cursor-pointer"
              onClick={() => !isEditingItem && startEditing(idx, item)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{item.icon}</span>
                  {isEditingItem ? (
                    <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <input 
                          className="w-12 bg-transparent border-b border-brand-sage outline-none text-2xl text-center"
                          value={tempEdit?.icon}
                          onChange={(e) => setTempEdit(p => p ? ({ ...p, icon: e.target.value }) : null)}
                        />
                        <input 
                          className="flex-1 bg-transparent border-b border-brand-sage outline-none text-text-primary font-serif"
                          value={tempEdit?.name}
                          onChange={(e) => setTempEdit(p => p ? ({ ...p, name: e.target.value }) : null)}
                        />
                      </div>
                      <input 
                        type="number"
                        className="w-full bg-transparent border-b border-brand-sage outline-none text-brand-rose-dark font-bold font-sans"
                        value={tempEdit?.amount}
                        onChange={(e) => setTempEdit(p => p ? ({ ...p, amount: Number(e.target.value) }) : null)}
                      />
                      <div className="flex gap-2 pt-2">
                        <button onClick={saveEdit} className="text-[10px] font-bold uppercase tracking-widest text-green-500">Save</button>
                        <button onClick={() => setEditingIdx(null)} className="text-[10px] font-bold uppercase tracking-widest text-red-500">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-lg font-serif text-text-primary">{item.name}</h4>
                      <p className="text-sm font-bold text-brand-rose-dark">{formatCurrency(item.amount, currency)}</p>
                    </div>
                  )}
                </div>
                {!isEditingItem && (
                   <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-300 hover:text-brand-rose">
                     <Trash2 className="w-4 h-4" />
                   </button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                  <span>Profit Coverage</span>
                  <span className={isFunded ? 'text-text-primary font-bold' : 'text-brand-rose-dark font-bold'}>{isFunded ? 'Ready to purchase!' : `${coverage}% covered`}</span>
                </div>
                <div className="w-full bg-neutral-100/50 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(coverage, 0)}%` }}
                    className={`h-full ${isFunded ? 'bg-brand-sage' : 'bg-brand-rose-dark'}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TakeProfitNotification = () => {
  const { currency, isPriceAlertsEnabled, stocks } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(() => {
    return sessionStorage.getItem('dismissed_vibe_alert') === 'true';
  });
  
  // Find the top performer for more accurate manifestation
  const topPerformer = [...stocks].sort((a, b) => b.change - a.change)[0];

  useEffect(() => {
    if (!isPriceAlertsEnabled || stocks.length === 0 || !topPerformer || topPerformer.change <= 5 || hasDismissed) {
      setIsVisible(false);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), 12000);
    return () => clearTimeout(timer);
  }, [isPriceAlertsEnabled, stocks.length, topPerformer?.change, hasDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    sessionStorage.setItem('dismissed_vibe_alert', 'true');
  };

  return (
    <AnimatePresence>
      {(isVisible && topPerformer) && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-10 right-10 z-50 pointer-events-none"
        >
          <div className="bg-brand-bg text-text-primary border border-brand-sage/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden pointer-events-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-rose" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Vibe Alert! xxx</span>
            </div>
            
            <p className="text-text-primary/80 text-xs leading-relaxed mb-4 font-medium italic">
              "Your <span className="text-text-primary font-bold">{topPerformer.ticker}</span> position is literally serving main character energy ({topPerformer.change}% up!). 
              Maybe cash out for that wishlist item, babe?" <br/>
              <span className="text-[9px] opacity-40 uppercase tracking-widest mt-2 block font-bold">Not Financial Advice hun xxx</span>
            </p>
            
            <button 
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl border border-brand-sage/20 text-text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-brand-sage/5 transition-colors cursor-pointer"
            >
              LATER
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navigation = () => {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-bg border-t border-brand-sage/10 px-8 py-4 flex justify-between items-center z-40 transition-colors duration-300">
      <button 
        onClick={() => setActiveTab('Terminal')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Terminal' ? 'text-text-primary scale-110' : 'text-neutral-300 hover:text-text-primary'}`}
      >
        <Target className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Terminal</span>
      </button>
      <button 
        onClick={() => setActiveTab('Portfolio')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Portfolio' ? 'text-text-primary scale-110' : 'text-neutral-300 hover:text-text-primary'}`}
      >
        <Wallet className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">My Portfolio</span>
      </button>
      <button 
        onClick={() => setActiveTab('Wishlist')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'Wishlist' ? 'text-text-primary scale-110' : 'text-neutral-300 hover:text-text-primary'}`}
      >
        <Gift className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Wishlist</span>
      </button>
    </div>
  );
};

const UnsavedChangesModal = ({ 
  onSave, 
  onDiscard, 
  onCancel 
}: { 
  onSave: () => void; 
  onDiscard: () => void; 
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-brand-bg rounded-3xl p-8 border-2 border-brand-sage max-w-sm w-full shadow-2xl relative"
      >
        <h3 className="text-xl font-serif text-text-primary mb-4 leading-tight">
          Are you sure you would like to leave without saving your settings?
        </h3>
        <div className="space-y-3">
          <button 
            onClick={onSave}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-600 transition-colors shadow-lg"
          >
            yass save
          </button>
          <button 
            onClick={onDiscard}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors shadow-lg"
          >
            nope, don't save
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 border-2 border-brand-sage text-text-primary rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all"
          >
            cancel
          </button>
        </div>
      </motion.div>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10" />
    </div>
  );
};

const VibeCheckPopup = ({ vibe, onClose }: { vibe: { ticker: string; message: string; isPositive: boolean } | null; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {vibe && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-brand-bg rounded-3xl p-8 max-w-sm w-full shadow-2xl relative pointer-events-auto border-2 border-brand-sage"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${vibe.isPositive ? 'bg-brand-sage text-brand-bg' : 'bg-brand-rose text-brand-bg'}`}>
                {vibe.isPositive ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-serif text-text-primary mb-2 tracking-tight">Alignment Check: {vibe.ticker}</h3>
              <p className="text-text-primary/60 italic font-medium leading-relaxed">"{vibe.message}"</p>
              <button 
                onClick={onClose}
                className="mt-6 w-full py-4 bg-brand-sage text-brand-bg rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg active:scale-95"
              >
                Understood.
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] -z-10"
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  );
}


export default function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorGrade, setColorGrade] = useState<ColorGrade>('default');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [activeTab, setActiveTabState] = useState('Terminal');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsDirty, setIsSettingsDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showGuard, setShowGuard] = useState(false);
  const [vibeResult, setVibeResult] = useState<{ ticker: string; message: string; isPositive: boolean } | null>(null);

  const generateAiInsights = async (currentStocks: Stock[], balance: number, profit: number) => {
    if (!currentStocks || currentStocks.length === 0) return;
    setIsGeneratingInsights(true);

    const totals = {
      totalInvested: currentStocks.reduce((acc, s) => acc + (s.avgBuyPrice * s.quantity), 0),
      totalValue: balance,
      totalProfit: profit
    };

    const cleanedData = currentStocks.map(a => ({
      asset: a.name,
      ticker: a.ticker,
      current_value: a.totalValue,
      profit_loss: (a.price - a.avgBuyPrice) * a.quantity
    }));

    const prompt = `
You are a premium financial insights assistant inside a modern portfolio tracking app.

IMPORTANT:
All numerical values are already pre-calculated.
DO NOT perform any calculations.
ONLY interpret the data.

Portfolio Summary:
- Total invested: ${totals.totalInvested.toFixed(2)}
- Total value: ${totals.totalValue.toFixed(2)}
- Total profit/loss: ${totals.totalProfit.toFixed(2)}

Assets:
${JSON.stringify(cleanedData.map(a => ({
  asset: a.asset,
  ticker: a.ticker,
  value: a.current_value,
  profit_loss: a.profit_loss
})), null, 2)}

Tasks:
- Portfolio Snapshot
- Winners & Losers
- Risk Overview
- Suggestions

Tone: clean, modern, slightly conversational.
`;

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          totalInvested: totals.totalInvested,
          totalValue: totals.totalValue,
          totalProfit: totals.totalProfit,
          assets: cleanedData,
          customPrompt: prompt
        })
      });
      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
      } else if (data.error && response.status === 503) {
        setAiInsights(`Portfolio Snapshot\n- The AI service is currently not configured.\n- Please provide a valid GEMINI_API_KEY in the project secrets.\n- You can still track your portfolio manually in the meantime! xxx`);
      }
    } catch (e) {
      console.error("Failed to generate AI insights:", e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  const [accountType, setAccountType] = useState<string | null>(null);
  const [serverIp, setServerIp] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => localStorage.getItem('portfolio_last_updated'));
  const [uploadedPortfolio, setUploadedPortfolio] = useState<any[]>(() => {
    const saved = localStorage.getItem('uploaded_portfolio');
    return saved ? JSON.parse(saved) : [];
  });
  const [isPriceAlertsEnabled, setIsPriceAlertsEnabled] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passcodeEnabled: false,
    biometricEnabled: true,
    twoStepEnabled: true,
    marketingPrefs: false,
    dataProtection: true,
    currentPasscode: '0000'
  });
  const [userData, setUserData] = useState<UserData>({ 
    name: 'Ginika Destiny', 
    email: 'ginikadestiny97@gmail.com',
    dob: '12101997',
    gender: 'Female',
    phone: '',
    phoneCode: '+44',
    avatar: '' 
  });
  const [goalData, setGoalData] = useState({ name: 'London', target: 15000 });
  const [wishlistItems, setWishlistItems] = useState<Goal[]>([
    { name: "Acrylics", amount: 55, icon: "💅" },
    { name: "Vintage Chanel", amount: 2400, icon: "👜" },
    { name: "YSL Heels", amount: 850, icon: "👠" },
    { name: "Pilates Retreat", amount: 1200, icon: "🧘" },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Market Sentiment', message: 'Main character energy detected in NVDA. She’s literally mooning, babe! 🚀', type: 'info', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', title: 'Daily Dose', message: 'Market’s closed, babe! 🥂 Your portfolio finished +2.4% today. Go enjoy your evening!', type: 'success', timestamp: new Date(Date.now() - 7200000) }
  ]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const totalDividends = stocks.reduce((acc, s) => acc + (s.dividends || 0), 0);
  const totalResult = totalProfit + totalDividends;
  const [brokerApiKey, setBrokerApiKey] = useState('');
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    if (stocks.length > 0 && !aiInsights && !isGeneratingInsights) {
        generateAiInsights(stocks, totalBalance, totalResult);
    }
  }, [stocks]);

  const saveTriggerRef = React.useRef<(() => void) | null>(null);

  const setActiveTab = (tab: string) => {
    if (activeTab === 'Settings' && isSettingsDirty && tab !== 'Settings') {
      setPendingTab(tab);
      setShowGuard(true);
    } else {
      setActiveTabState(tab);
    }
  };

  useEffect(() => {
    if (stocks.length > 0) {
      const interval = setInterval(() => {
        refreshPrices();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [stocks.length]);

  const triggerSaveSettings = () => {
    if (saveTriggerRef.current) {
      saveTriggerRef.current();
    }
  };

  const handleYassSave = () => {
    triggerSaveSettings();
    if (pendingTab) {
      setActiveTabState(pendingTab);
      setPendingTab(null);
    }
    setShowGuard(false);
  };

  const handleNopeDiscard = () => {
    setIsSettingsDirty(false);
    if (pendingTab) {
      setActiveTabState(pendingTab);
      setPendingTab(null);
    }
    setShowGuard(false);
  };

  useEffect(() => {
    localStorage.setItem('uploaded_portfolio', JSON.stringify(uploadedPortfolio));
    if (lastUpdated) localStorage.setItem('portfolio_last_updated', lastUpdated);
  }, [uploadedPortfolio, lastUpdated]);

  const handleCsvUpload = async (file: File): Promise<void> => {
    setIsRefreshing(true);
    setLastSyncError(null);

    // All parsing and state hydration happens entirely in the browser.
    // No data is sent to any server or external API at any point in this function.
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data;
          if (!rawData || rawData.length === 0) {
            throw new Error("CSV file looks empty — nothing to import.");
          }

          // ---------- header-mapping helpers ----------
          // Returns the first row value whose column key matches any of the candidate strings
          // (case-insensitive substring match so "Price / Share" hits "price").
          const pick = (row: Record<string, string>, candidates: string[]): string => {
            const key = Object.keys(row).find(k =>
              candidates.some(c => k.toLowerCase().trim().includes(c.toLowerCase().trim()))
            );
            return key ? (row[key] ?? '') : '';
          };

          const num = (raw: string): number => {
            const n = parseFloat(raw.replace(/,/g, ''));
            return isNaN(n) ? 0 : n;
          };

          // ---------- aggregation ----------
          type Bucket = {
            ticker: string;
            name: string;
            quantity: number;
            totalCost: number;
            totalValue: number;
            dividends: number;
            dividendsCash: number;
            dividendsReinvested: number;
            slice: string;
          };
          const buckets: Record<string, Bucket> = {};

          for (const row of rawData) {
            const action = pick(row, ['action', 'type', 'transaction']).toLowerCase();

            // Resolve ticker — fall back to slugified name for brokers that omit it
            let ticker = pick(row, ['ticker', 'symbol', 'instrument', 'id']).trim().toUpperCase();
            const assetName = pick(row, ['full name', 'instrument name', 'company', 'description', 'asset', 'name']).trim();
            const sliceName = pick(row, ['slice', 'category', 'sector', 'pie']).trim();

            if (!ticker || ticker === 'N/A') {
              if (assetName) {
                ticker = assetName.length <= 6 && !assetName.includes(' ')
                  ? assetName.toUpperCase()
                  : assetName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
              }
            }

            // Skip deposits, withdrawals, and rows without a resolvable ticker
            if (!ticker || action.includes('deposit') || action.includes('withdraw')) continue;

            const name = assetName || ticker;
            const quantity = num(pick(row, ['quantity', 'shares', 'no. of shares', 'amount', 'count']));
            const price    = num(pick(row, ['price / share', 'price', 'buy price', 'avg', 'cost']));
            const divValue = num(pick(row, ['dividend', 'payout', 'income', 'yield', 'total (gbp)', 'total']));
            const planValue = num(pick(row, ['total value', 'market value', 'plan', 'value']));

            if (!buckets[ticker]) {
              buckets[ticker] = { ticker, name, quantity: 0, totalCost: 0, totalValue: 0, dividends: 0, dividendsCash: 0, dividendsReinvested: 0, slice: sliceName };
            }

            const b = buckets[ticker];

            if (action.includes('buy') || action === 'market buy' || action === 'limit buy') {
              b.quantity  += quantity;
              b.totalCost += quantity * price;
            } else if (action.includes('sell')) {
              // Reduce quantity; cost-basis reduction is proportional
              const costPerShare = b.quantity > 0 ? b.totalCost / b.quantity : 0;
              b.quantity  = Math.max(0, b.quantity - quantity);
              b.totalCost = Math.max(0, b.totalCost - quantity * costPerShare);
            } else if (action.includes('dividend')) {
              b.dividends += divValue;
              if (action.includes('reinvest')) b.dividendsReinvested += divValue;
              else b.dividendsCash += divValue;
            } else {
              // No action column — treat each row as a portfolio-snapshot row (one asset per line)
              b.quantity   = quantity  || b.quantity;
              b.totalCost  = quantity * price || b.totalCost;
              b.dividends += divValue;
              if (planValue > 0) b.totalValue = planValue;
              if (sliceName && !b.slice) b.slice = sliceName;
            }
          }

          // ---------- fallback: headerless CSV (columns: ticker, qty, avgPrice, dividends, name) ----------
          const buildFromHeaderless = (): Stock[] =>
            rawData.flatMap((row) => {
              const vals = Object.values(row);
              if (vals.length < 2) return [];
              const ticker = vals[0]?.toString().trim().toUpperCase();
              const quantity = parseFloat(vals[1]?.toString() ?? '0');
              if (!ticker || isNaN(quantity) || quantity <= 0) return [];
              const avgBuyPrice = parseFloat(vals[2]?.toString() ?? '0') || 0;
              const dividends   = parseFloat(vals[3]?.toString() ?? '0') || 0;
              const name        = vals[4]?.toString().trim() || ticker;
              const totalValue  = quantity * avgBuyPrice;
              const isCrypto    = detectCrypto(ticker);
              return [{
                ticker, name, quantity, avgBuyPrice,
                price: avgBuyPrice, change: 0, dailyMove: 0,
                vibe: 'neutral' as const,
                narrative: buildNarrative(totalValue - totalValue, totalValue),
                totalValue, investedValue: totalValue, result: 0,
                dividends, dividendsGained: dividends, dividendsCash: dividends, dividendsReinvested: 0,
                slice: '', type: isCrypto ? 'crypto' : 'stock' as 'stock' | 'crypto',
              }];
            });

          // ---------- map buckets → Stock objects (fully local, no prices fetched) ----------
          const KNOWN_CRYPTO = new Set(['BTC', 'ETH', 'SOL', 'ALGO', 'DOT', 'ADA', 'XRP', 'DOGE', 'LINK', 'AVAX', 'MATIC', 'LTC', 'BNB']);
          const detectCrypto = (t: string) => t.length > 5 || KNOWN_CRYPTO.has(t);

          const buildNarrative = (result: number, value: number) =>
            result > 0
              ? `Up ${((result / Math.max(value - result, 1)) * 100).toFixed(1)}% on cost basis.`
              : result < 0
              ? `Down ${(Math.abs(result / Math.max(value - result, 1)) * 100).toFixed(1)}% on cost basis.`
              : 'Cost basis matches current value.';

          let processedStocks: Stock[] = Object.values(buckets)
            .filter(b => b.quantity > 0 || b.dividends > 0)
            .map((b): Stock => {
              const avgBuyPrice = b.quantity > 0 ? b.totalCost / b.quantity : 0;
              // Use the CSV-supplied market value when available; otherwise fall back to cost basis.
              // Either way, no external request is made.
              const currentPrice = b.totalValue > 0 && b.quantity > 0
                ? b.totalValue / b.quantity
                : avgBuyPrice;
              const totalValue   = b.totalValue > 0 ? b.totalValue : b.quantity * avgBuyPrice;
              const investedValue = b.totalCost;
              const result       = totalValue - investedValue;
              const changePct    = investedValue > 0 ? (result / investedValue) * 100 : 0;
              const isCrypto     = detectCrypto(b.ticker);

              return {
                ticker: b.ticker,
                name: b.name,
                price: currentPrice,
                change: Number(changePct.toFixed(2)),
                vibe: changePct > 5 ? 'high' : changePct < -5 ? 'low' : 'neutral',
                dailyMove: result / 30,
                narrative: buildNarrative(result, totalValue),
                quantity: b.quantity,
                avgBuyPrice,
                totalValue,
                investedValue,
                result,
                dividends: b.dividends,
                dividendsGained: b.dividends,
                dividendsCash: b.dividendsCash,
                dividendsReinvested: b.dividendsReinvested,
                slice: b.slice,
                type: isCrypto ? 'crypto' : 'stock',
              };
            });

          if (processedStocks.length === 0) {
            processedStocks = buildFromHeaderless();
          }

          if (processedStocks.length === 0) {
            throw new Error("No assets could be read from this CSV. Please check your column headers include Ticker and Quantity.");
          }

          // Persist parsed portfolio to localStorage and hydrate stocks state — entirely client-side.
          setUploadedPortfolio(processedStocks);
          setStocks(processedStocks);

          const totalV = processedStocks.reduce((acc, s) => acc + s.totalValue, 0);
          const totalP = processedStocks.reduce((acc, s) => acc + (s.result ?? 0), 0);
          const totalD = processedStocks.reduce((acc, s) => acc + (s.dividends ?? 0), 0);

          setTotalBalance(totalV);
          setTotalProfit(totalP);
          setLastUpdated(new Date().toISOString());
          setLastSyncError(null);

          generateAiInsights(processedStocks, totalV, totalP + totalD);
        } catch (err: any) {
          console.error("CSV Import Error:", err);
          const msg = err.message || "Failed to parse CSV.";
          setLastSyncError(msg);
          alert(msg);
        } finally {
          setIsRefreshing(false);
        }
      },
      error: (err) => {
        setLastSyncError(`CSV parse error: ${err.message}`);
        setIsRefreshing(false);
      },
    });
  };

  const refreshPrices = async (portfolioToUse = uploadedPortfolio) => {
    if (!portfolioToUse || portfolioToUse.length === 0) {
      setIsRefreshing(false);
      return;
    }
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assets: portfolioToUse.map((a: any) => ({ ticker: a.ticker, type: a.type }))
        })
      });
      
      const data = await response.json();
      const prices = data.prices || {};

      const processedStocks: Stock[] = portfolioToUse.map((asset: any) => {
        // Avoid generic 150.00 fallback if user provided data. 
        // If live price fails, fallback to avgBuyPrice if it's sane (> 0.01), otherwise use a generic starting price for visual mock only.
        const defaultFallback = 100.00;
        const live = prices[asset.ticker] || { price: (asset.avgBuyPrice && asset.avgBuyPrice > 0.01) ? asset.avgBuyPrice : defaultFallback, change: 0 };
        
        const currentPrice = live.price;
        const totalValue = currentPrice * asset.quantity;
        const investedValue = (asset.avgBuyPrice || 0) * asset.quantity;
        const result = totalValue - investedValue;
        const change = asset.avgBuyPrice > 0 ? ((currentPrice - asset.avgBuyPrice) / asset.avgBuyPrice) * 100 : live.change;

        return {
          ticker: asset.ticker,
          name: asset.name || live.name || asset.ticker,
          price: currentPrice,
          change: Number(change.toFixed(2)),
          vibe: change > 5 ? 'high' : (change < -5 ? 'low' : 'neutral'),
          dailyMove: result / 30, // Simulated daily move
          narrative: result > 0 ? `Serving profit. Manifesting ${formatCurrency(result, currency)} gains. ✨` : `Holding steady. Alignment check in progress. 🕯️`,
          quantity: asset.quantity,
          avgBuyPrice: asset.avgBuyPrice || 0,
          totalValue: totalValue,
          investedValue: investedValue,
          result: result,
          dividends: asset.dividends || 0,
          dividendsGained: asset.dividends || 0,
          dividendsCash: asset.dividendsCash || 0,
          dividendsReinvested: asset.dividendsReinvested || 0,
          slice: asset.slice || '',
          type: asset.type || 'stock'
        };
      });

      setStocks(processedStocks);
      
      const totalV = processedStocks.reduce((acc, s) => acc + s.totalValue, 0);
      const totalP = processedStocks.reduce((acc, s) => acc + (s.totalValue - (s.avgBuyPrice * s.quantity)), 0);
      
      setTotalBalance(totalV);
      setTotalProfit(totalP);
      setLastUpdated(new Date().toISOString());
      setLastSyncError(null);

      // Trigger AI insights
      generateAiInsights(processedStocks, totalV, totalP + processedStocks.reduce((acc, s) => acc + (s.dividends || 0), 0));
    } catch (err: any) {
      setLastSyncError("Price refresh failed. System is vibing elsewhere. 🕯️");
    } finally {
      setIsRefreshing(false);
    }
  };

  const resetPortfolio = () => {
    setUploadedPortfolio([]);
    setStocks([]);
    setTotalBalance(0);
    setTotalProfit(0);
    setAiInsights(null);
    setLastUpdated(null);
    localStorage.removeItem('uploaded_portfolio');
    localStorage.removeItem('portfolio_last_updated');
  };

  useEffect(() => {
    if (uploadedPortfolio.length > 0 && stocks.length === 0) {
      refreshPrices();
    }
  }, []);

  const welcomeMessages = [
    "Welcome back, main character! Time to serve some premium gains. 💅🥂",
    "Alignment check: The market is vibing with your energy today. ✨🕯️",
    "Rise and grind, bestie. Your next luxury bag is waiting in the charts. 👜📈",
    "Manifesting consistent green for our favorite visionary. Let's cook. 🌙🍲",
    "Reality check: You're wealthy, iconic, and absolutely killing it. 🥂💖"
  ];

  useEffect(() => {
    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const noteId = Date.now().toString();
    setNotifications(p => [{ id: noteId, title: 'Welcome Back! ✨', message: randomWelcome, type: 'info', timestamp: new Date() }, ...p]);
    setHasUnreadNotifications(true);
  }, []);
  
  // Clear all notifications logic
  const clearNotifications = () => {
    setNotifications([]);
    setHasUnreadNotifications(false);
  };

  // Mark notifications as read
  const markNotificationsAsRead = () => {
    setHasUnreadNotifications(false);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-grade', colorGrade);
  }, [colorGrade]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const removeStock = (ticker: string) => {
    setStocks(prev => prev.filter(s => s.ticker !== ticker));
  };

  const vibeCheckStock = (ticker: string) => {
    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock || stock.change === 0) return;

    const change = stock.change;
    
    const positiveMessages = [
      `Main Character Energy! ${ticker} is up ${change.toFixed(1)}%. She’s literally funding your next luxury haul right now. 👜✨`,
      `Literal moon mission. ${ticker} is serving premium gains today. We love to see a queen thrive. 🚀🥂`,
      `${ticker} is in her bag! +${change.toFixed(1)}%? That's the alignment we manifest. ✨💸`,
      `Absolute peak behavior from ${ticker}. Your portfolio is glowing, babe. Stay in your magic. 🏔️✨`,
      `Wealth is attractive, and ${ticker} is looking gorgeous today at +${change.toFixed(1)}%. 💖💅`
    ];

    const negativeMessages = [
      `${ticker} is just catching her breath (-${Math.abs(change).toFixed(1)}%). Consider it a discount for the girls who get it. 🛍️🕯️`,
      `Minor plot twist from ${ticker}. We’re just gathering strength for an iconic comeback, trust. 📖💫`,
      `Retrograde energy detected in ${ticker}. Red is just a seasonal mood, we stay manifesting. 🥀🥂`,
      `She's reflecting right now. A self-aware dip of ${change.toFixed(1)}% before the next big rally. 🌊🧘‍♀️`,
      `Alignment check incoming. ${ticker} is testing your Diamond Hands energy, bestie. 💎💅`
    ];

    const neutralMessages = [
      `${ticker} is in Hermit Mode today. Accumulating quietly like a pro. Let her cook. 🕯️🌙`,
      `Stable energy from ${ticker}. We love a grounded queen who knows her worth. 🧘‍♀️✨`,
      `Quiet before the storm. ${ticker} is just deciding which moon to hit next. 🌙🎀`,
      `Sideways is a lifestyle. Maintaining the peace while the manifests are pending. 🛣️⚖️`,
      `Vibe: Calm. ${ticker} is preserving the frequency today. No notes. 🎀✨`
    ];

    let message = "";
    if (change > 3) {
      message = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    } else if (change < -3) {
      message = negativeMessages[Math.floor(Math.random() * negativeMessages.length)];
    } else {
      message = neutralMessages[Math.floor(Math.random() * neutralMessages.length)];
    }

    setVibeResult({
      ticker,
      message,
      isPositive: change >= 0
    });
  };

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, toggleTheme, colorGrade, setColorGrade, currency, setCurrency, 
      stocks, setStocks, vibeCheckStock, activeTab, setActiveTab,
      userData, setUserData, goalData, setGoalData, wishlistItems, setWishlistItems,
      totalBalance, totalProfit, totalResult, totalDividends, accountType, brokerApiKey, setBrokerApiKey, isMockMode, setIsMockMode,
      notifications, setNotifications, isPriceAlertsEnabled, setIsPriceAlertsEnabled,
      isSettingsDirty, setIsSettingsDirty, triggerSaveSettings,
      securitySettings, setSecuritySettings,
      hasUnreadNotifications, setHasUnreadNotifications, clearNotifications, markNotificationsAsRead,
      isRefreshing, lastSyncError, serverIp, lastUpdated, aiInsights, isGeneratingInsights, handleCsvUpload, refreshPrices, resetPortfolio
    }}>
      <div className="min-h-screen bg-brand-bg max-w-md mx-auto relative overflow-x-hidden transition-all duration-500 shadow-2xl">
        <NFABanner />
        
        {/* Decorative Blur Elements */}
        <div className="fixed top-[-5%] right-[-5%] w-72 h-72 bg-brand-sage/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-[15%] left-[-10%] w-96 h-96 bg-pink/20 rounded-full blur-[120px] pointer-events-none" />

        <main className="relative z-10 min-h-screen">
          <AnimatePresence mode="wait">
            {activeTab === 'Terminal' && (
              <motion.div 
                key="terminal"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
              >
                <Header />
                <LiveMarketTicker />
                <GoalsProgress />
                <WishlistTicker />
                <ActiveTrades />
                <IncomeTracker />
              </motion.div>
            )}
            
            {activeTab === 'Wishlist' && (
              <motion.div 
                key="wishlist"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WishlistPage />
              </motion.div>
            )}

            {activeTab === 'Portfolio' && (
              <motion.div 
                key="portfolio"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <WalletCentre />
              </motion.div>
            )}

            {activeTab === 'Settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsPage saveRef={saveTriggerRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <AnimatePresence>
          {showGuard && (
            <UnsavedChangesModal 
              onSave={handleYassSave}
              onDiscard={handleNopeDiscard}
              onCancel={() => setShowGuard(false)}
            />
          )}
        </AnimatePresence>

        <VibeCheckPopup vibe={vibeResult} onClose={() => setVibeResult(null)} />
        <TakeProfitNotification />
        <Navigation />
      </div>
    </AppContext.Provider>
  );
}

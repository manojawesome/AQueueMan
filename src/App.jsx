import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { TokenGenerator } from '@/components/TokenGenerator';
import { QueueDisplay } from '@/components/QueueDisplay';
import { QueueStats } from '@/components/QueueStats';
import { DepartmentOverview } from '@/components/DepartmentOverview';
import { TokenDisplay } from '@/components/TokenDisplay';
import { AdminPanel } from '@/components/AdminPanel';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage';
import { SaaSAdminPage } from '@/components/SaaSAdminPage';
import { useQueueSystem } from '@/hooks/useQueueSystem';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Search, 
  Activity,
  Bell,
  Settings,
  ShieldCheck,
  Briefcase, Store as StoreIcon, Landmark as BankIcon, Stethoscope,
  LogOut,
  CloudCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

function MainAppLayout({ currentUser, onLogout, businessConfig, departments, queue, completedTokens, generateToken, callNextToken, completeToken, cancelToken, getQueueStats, getDepartmentQueue, getTokenPosition, updateBusinessConfig, addDepartment, updateDepartment, removeDepartment }) {
  const [searchToken, setSearchToken] = useState('');
  const [foundToken, setFoundToken] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const stats = getQueueStats();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = businessConfig.name || "MQ System";
    document.documentElement.style.setProperty('--primary-dynamic', businessConfig.themeColor);
    const primaryColorValue = businessConfig.themeColor.startsWith('#') 
      ? hexToHslValue(businessConfig.themeColor)
      : businessConfig.themeColor; 
    document.documentElement.style.setProperty('--primary', primaryColorValue);
  }, [businessConfig.name, businessConfig.themeColor]);

  function hexToHslValue(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = "0x" + hex[1] + hex[1];
      g = "0x" + hex[2] + hex[2];
      b = "0x" + hex[3] + hex[3];
    } else if (hex.length === 7) {
      r = "0x" + hex[1] + hex[2];
      g = "0x" + hex[3] + hex[4];
      b = "0x" + hex[5] + hex[6];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return `${h} ${s}% ${l}%`;
  }

  const handleSearch = () => {
    if (!searchToken.trim()) {
      toast({
        title: "Enter Token ID",
        description: "Please enter a token ID to search",
        variant: "destructive"
      });
      return;
    }
    const token = queue.find(t => t.id.toLowerCase().includes(searchToken.toLowerCase())) ||
                  completedTokens.find(t => t.id.toLowerCase().includes(searchToken.toLowerCase()));
    if (token) {
      setFoundToken(token);
      toast({ title: "Token Found! 🎫", description: `Found token ${token.id} for ${token.customerName}` });
    } else {
      setFoundToken(null);
      toast({ title: "Token Not Found", description: "No token found with that ID", variant: "destructive" });
    }
  };

  const handleNotifications = () => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });
  const handleGeneralSettings = () => toast({ title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" });

  const BusinessTypeIcon = () => {
    switch (businessConfig.businessType) {
      case 'hospital': return <Stethoscope className="h-12 w-12 p-2 bg-primary/10 text-primary rounded-lg" />;
      case 'store': return <StoreIcon className="h-12 w-12 p-2 bg-primary/10 text-primary rounded-lg" />;
      case 'bank': return <BankIcon className="h-12 w-12 p-2 bg-primary/10 text-primary rounded-lg" />;
      default: return <Briefcase className="h-12 w-12 p-2 bg-primary/10 text-primary rounded-lg" />;
    }
  };
  
  const departmentLabel = { hospital: "Departments", store: "Sections", bank: "Counters" }[businessConfig.businessType] || "Units";

  const handleLogout = () => {
    onLogout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/login');
  };
  
  const isSaaSAdmin = currentUser && currentUser.email === 'saas_admin@mqsystem.com';


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-foreground">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {businessConfig.logoUrl ? (
                 <img src={businessConfig.logoUrl} alt={`${businessConfig.name} Logo`} className="h-12 w-auto rounded-md object-contain" />
              ) : ( <BusinessTypeIcon /> )}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" style={{ color: `hsl(var(--primary))` }}>
                  {businessConfig.name || "MQ System"}
                </h1>
                <p className="text-muted-foreground mt-1">{`Streamlined token management for ${businessConfig.businessType}s`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSaaSAdmin && (
                <Button variant="outline" onClick={() => navigate('/saas-admin')} className="glass-effect flex items-center gap-1">
                  <CloudCog className="h-4 w-4" /> SaaS Admin
                </Button>
              )}
              <Button variant="outline" onClick={handleNotifications} className="glass-effect"><Bell className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={handleGeneralSettings} className="glass-effect"><Settings className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={handleLogout} className="glass-effect"><LogOut className="h-4 w-4" /></Button>
            </div>
          </div>
          <QueueStats stats={stats} />
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2"><Users className="h-4 w-4" />Queue</TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2"><Building2 className="h-4 w-4" />{departmentLabel}</TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2"><Search className="h-4 w-4" />Search</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2"><Activity className="h-4 w-4" />Analytics</TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Admin</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {activeTab === "dashboard" && (
                <TabsContent value="dashboard" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DepartmentOverview departments={departments} getDepartmentQueue={getDepartmentQueue} onCallNext={callNextToken} businessType={businessConfig.businessType} />
                    </div>
                    <div>
                      <TokenGenerator departments={departments} onGenerateToken={generateToken} serviceTypes={businessConfig.typeSpecificSettings?.serviceTypes || []} businessType={businessConfig.businessType} />
                    </div>
                  </div>
                </TabsContent>
              )}
              {activeTab === "queue" && (
                <TabsContent value="queue" className="space-y-6 mt-0">
                  <QueueDisplay queue={queue} departments={departments} onCallNext={callNextToken} onCompleteToken={completeToken} onCancelToken={cancelToken} getTokenPosition={getTokenPosition} businessType={businessConfig.businessType} />
                </TabsContent>
              )}
              {activeTab === "departments" && (
                <TabsContent value="departments" className="space-y-6 mt-0">
                  <DepartmentOverview departments={departments} getDepartmentQueue={getDepartmentQueue} onCallNext={callNextToken} businessType={businessConfig.businessType} />
                </TabsContent>
              )}
              {activeTab === "search" && (
                <TabsContent value="search" className="space-y-6 mt-0">
                  <Card className="glass-effect">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Search Token</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input placeholder="Enter token ID (e.g., GEN-001)" value={searchToken} onChange={(e) => setSearchToken(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="flex-1" />
                        <Button onClick={handleSearch}><Search className="h-4 w-4" /></Button>
                      </div>
                      {foundToken && ( <div className="mt-6"><TokenDisplay token={foundToken} position={getTokenPosition(foundToken.id)} department={departments.find(d => d.id === foundToken.department)} /></div> )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
              {activeTab === "analytics" && (
                <TabsContent value="analytics" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="glass-effect"><CardHeader><CardTitle>Queue Performance</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between"><span>Total Tokens Today:</span><span className="font-bold">{queue.length + completedTokens.length}</span></div><div className="flex justify-between"><span>Completion Rate:</span><span className="font-bold">{queue.length + completedTokens.length > 0 ? Math.round((completedTokens.length / (queue.length + completedTokens.length)) * 100) : 0}%</span></div><div className="flex justify-between"><span>Active {departmentLabel}:</span><span className="font-bold">{departments.length}</span></div></div></CardContent></Card>
                    <Card className="glass-effect"><CardHeader><CardTitle>{departmentLabel} Status</CardTitle></CardHeader><CardContent><div className="space-y-3">{departments.map(dept => { const deptQueue = getDepartmentQueue(dept.id); const waiting = deptQueue.filter(t => t.status === 'waiting').length; return ( <div key={dept.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} /> <span className="text-sm">{dept.name}</span></div><span className="text-sm font-medium">{waiting} waiting</span></div> ); })} {departments.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">No {departmentLabel.toLowerCase()} found.</p>}</div></CardContent></Card>
                  </div>
                </TabsContent>
              )}
              {activeTab === "admin" && (
                <TabsContent value="admin" className="space-y-6 mt-0">
                  <AdminPanel businessConfig={businessConfig} departments={departments} onUpdateBusinessConfig={updateBusinessConfig} onAddDepartment={addDepartment} onUpdateDepartment={updateDepartment} onRemoveDepartment={removeDepartment} />
                </TabsContent>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}

function ProtectedRoute({ children, currentUser, isSaaSAdminRoute = false }) {
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (isSaaSAdminRoute && currentUser.email !== 'saas_admin@mqsystem.com') {
    toast({ title: "Access Denied", description: "You do not have permission to access this page.", variant: "destructive" });
    return <Navigate to="/" replace />;
  }
  return children;
}


function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('mq_currentUser')));
  const queueSystemProps = useQueueSystem(); 
  const location = useLocation();

  const handleLogin = (user) => {
    localStorage.setItem('mq_currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('mq_currentUser');
    setCurrentUser(null);
  };

  useEffect(() => {
    let users = JSON.parse(localStorage.getItem('mq_users')) || [];
    const saasAdminEmail = 'saas_admin@mqsystem.com';
    const saasAdminPassword = 'Manoj@1234';
    let saasAdminUser = users.find(u => u.email === saasAdminEmail);

    if (saasAdminUser) {
      if (saasAdminUser.password !== saasAdminPassword) {
        saasAdminUser.password = saasAdminPassword;
        saasAdminUser.name = saasAdminUser.name || "SaaS Admin"; 
      }
    } else {
      users.push({ name: "SaaS Admin", email: saasAdminEmail, password: saasAdminPassword });
    }
    localStorage.setItem('mq_users', JSON.stringify(users));

    const storedCurrentUser = JSON.parse(localStorage.getItem('mq_currentUser'));
    if (storedCurrentUser) {
      setCurrentUser(storedCurrentUser);
    }
  }, []);
  
  return (
    <>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={currentUser ? <Navigate to="/" /> : <ForgotPasswordPage />} />
        
        <Route 
          path="/saas-admin"
          element={
            <ProtectedRoute currentUser={currentUser} isSaaSAdminRoute={true}>
              <SaaSAdminPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/*" 
          element={
            <ProtectedRoute currentUser={currentUser}>
              <MainAppLayout 
                currentUser={currentUser}
                onLogout={handleLogout} 
                {...queueSystemProps} 
              />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
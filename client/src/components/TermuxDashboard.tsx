import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Package, Folder, Terminal, Code, Zap, Activity, 
  Smartphone, GitBranch, Server, Menu, X, LogOut, Settings
} from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: <Activity className="w-5 h-5" />, path: '/dashboard' },
  { id: 'packages', label: 'Packages', icon: <Package className="w-5 h-5" />, path: '/packages' },
  { id: 'files', label: 'File Manager', icon: <Folder className="w-5 h-5" />, path: '/files' },
  { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-5 h-5" />, path: '/terminal' },
  { id: 'scripts', label: 'Scripts', icon: <Code className="w-5 h-5" />, path: '/scripts' },
  { id: 'templates', label: 'Templates', icon: <Zap className="w-5 h-5" />, path: '/templates' },
  { id: 'api', label: 'Termux API', icon: <Smartphone className="w-5 h-5" />, path: '/api' },
  { id: 'git', label: 'Git', icon: <GitBranch className="w-5 h-5" />, path: '/git' },
  { id: 'services', label: 'Services', icon: <Server className="w-5 h-5" />, path: '/services' },
];

interface TermuxDashboardProps {
  children: React.ReactNode;
}

export function TermuxDashboard({ children }: TermuxDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  const currentPath = location;
  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <h1 className="text-xl font-bold gradient-text">Termux</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
              title={item.label}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-2">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </h2>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

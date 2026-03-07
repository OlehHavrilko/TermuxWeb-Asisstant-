import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getLoginUrl } from '@/const';
import { Terminal, Package, Zap, Code, Server, Activity } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold gradient-text">Termux Assistant</h1>
          </div>
          <a href={getLoginUrl()} className="btn-elegant-primary">
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Powerful Control Panel for Termux
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Manage your Termux environment with an elegant, intuitive web interface.
            Package management, file operations, terminal access, and more—all in one place.
          </p>
          <a href={getLoginUrl()} className="btn-elegant-primary text-lg px-8 py-3 inline-block">
            Get Started
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-elegant p-6">
              <Package className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">Package Management</h4>
              <p className="text-muted-foreground">
                Search, install, update, and remove Termux packages with dependency information
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-elegant p-6">
              <Terminal className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">Web Terminal</h4>
              <p className="text-muted-foreground">
                Full-featured terminal with tabs, history, auto-completion, and real-time output
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-elegant p-6">
              <Code className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">Script Editor</h4>
              <p className="text-muted-foreground">
                Create and manage Bash, Python, and Node.js scripts with scheduling capabilities
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-elegant p-6">
              <Zap className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">Project Templates</h4>
              <p className="text-muted-foreground">
                Quick deployment of development environments for Python, Node.js, and Go
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-elegant p-6">
              <Activity className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">System Monitoring</h4>
              <p className="text-muted-foreground">
                Real-time monitoring of CPU, RAM, battery, and network activity
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-elegant p-6">
              <Server className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-lg font-semibold mb-2">Service Management</h4>
              <p className="text-muted-foreground">
                Start, stop, and monitor local servers and database services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Sign in to access your Termux control panel and start managing your environment
            with ease.
          </p>
          <a href={getLoginUrl()} className="btn-elegant-primary text-lg px-8 py-3 inline-block">
            Sign In Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Termux Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

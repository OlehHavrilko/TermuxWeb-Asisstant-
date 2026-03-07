import React from 'react';
import { TermuxDashboard } from '@/components/TermuxDashboard';
import { Card } from '@/components/ui/card';
import { Activity, Zap, AlertCircle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <TermuxDashboard>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Termux Assistant</h1>
          <p className="text-muted-foreground text-lg">
            Your powerful control panel for managing Termux environment and development tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 card-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">System Status</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Activity className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 card-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">CPU Usage</p>
                <p className="text-2xl font-bold">24%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 card-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">RAM Usage</p>
                <p className="text-2xl font-bold">1.8 GB</p>
              </div>
              <Zap className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 card-elegant">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                <p className="text-2xl font-bold">12h 34m</p>
              </div>
              <AlertCircle className="w-8 h-8 text-accent" />
            </div>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Management */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">Package Management</h3>
            <p className="text-muted-foreground mb-4">
              Search, install, update, and manage Termux packages with an intuitive interface
            </p>
            <button className="btn-elegant-primary">Open Packages</button>
          </Card>

          {/* File Manager */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">File Manager</h3>
            <p className="text-muted-foreground mb-4">
              Navigate and manage files with tree view, supporting create, edit, copy, and delete operations
            </p>
            <button className="btn-elegant-primary">Open Files</button>
          </Card>

          {/* Terminal */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">Web Terminal</h3>
            <p className="text-muted-foreground mb-4">
              Full-featured terminal with tabs, history, auto-completion, and real-time output
            </p>
            <button className="btn-elegant-primary">Open Terminal</button>
          </Card>

          {/* Scripts */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">Script Editor</h3>
            <p className="text-muted-foreground mb-4">
              Create and manage Bash, Python, and Node.js scripts with scheduling capabilities
            </p>
            <button className="btn-elegant-primary">Open Scripts</button>
          </Card>

          {/* Project Templates */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">Project Templates</h3>
            <p className="text-muted-foreground mb-4">
              Quick deployment of development environments for Python, Node.js, and Go
            </p>
            <button className="btn-elegant-primary">Browse Templates</button>
          </Card>

          {/* System Monitoring */}
          <Card className="p-6 card-elegant">
            <h3 className="text-lg font-semibold mb-4">System Monitor</h3>
            <p className="text-muted-foreground mb-4">
              Real-time monitoring of CPU, RAM, battery, and network activity
            </p>
            <button className="btn-elegant-primary">View Monitor</button>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 card-elegant">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium">Updated system packages</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <span className="badge badge-accent">Completed</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="font-medium">Created new Python project</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
              <span className="badge badge-accent">Completed</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Cloned Git repository</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <span className="badge badge-accent">Completed</span>
            </div>
          </div>
        </Card>
      </div>
    </TermuxDashboard>
  );
}

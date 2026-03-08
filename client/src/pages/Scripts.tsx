import React, { useState } from 'react';
import { TermuxDashboard } from '@/components/TermuxDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Play, Trash2, Clock, FileText } from 'lucide-react';

interface Script {
  id: string;
  name: string;
  language: 'bash' | 'python' | 'node';
  description: string;
  scheduled: boolean;
  cronExpression?: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'success' | 'failed';
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: 'update-system',
      language: 'bash',
      description: 'Update all system packages',
      scheduled: true,
      cronExpression: '0 2 * * *',
      lastRun: '2 hours ago',
      status: 'success',
    },
    {
      id: '2',
      name: 'backup-data',
      language: 'bash',
      description: 'Backup important files',
      scheduled: true,
      cronExpression: '0 0 * * 0',
      lastRun: '1 day ago',
      status: 'success',
    },
    {
      id: '3',
      name: 'process-logs',
      language: 'python',
      description: 'Process and analyze log files',
      scheduled: false,
      lastRun: '3 hours ago',
      status: 'idle',
    },
  ]);

  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showNewScriptForm, setShowNewScriptForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'badge-accent';
      case 'failed':
        return 'badge-destructive';
      case 'running':
        return 'animate-pulse-subtle';
      default:
        return '';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'bash':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'python':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'node':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return '';
    }
  };

  return (
    <TermuxDashboard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Script Editor</h1>
            <p className="text-muted-foreground">
              Create, manage, and schedule Bash, Python, and Node.js scripts
            </p>
          </div>
          <Button
            onClick={() => setShowNewScriptForm(true)}
            className="btn-elegant-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Script
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scripts List */}
          <div className="lg:col-span-1 space-y-3">
            <Card className="p-4 card-elegant">
              <h3 className="font-semibold mb-3">Your Scripts</h3>
              <div className="space-y-2">
                {scripts.map((script) => (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScript(script)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedScript?.id === script.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{script.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {script.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Script Details */}
          <div className="lg:col-span-2">
            {selectedScript ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <Card className="p-6 card-elegant">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedScript.name}</h2>
                      <p className="text-muted-foreground">{selectedScript.description}</p>
                    </div>
                    <span className={`badge ${getLanguageColor(selectedScript.language)}`}>
                      {selectedScript.language.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <span className={`badge ${getStatusColor(selectedScript.status)}`}>
                        {selectedScript.status.charAt(0).toUpperCase() +
                          selectedScript.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Run</p>
                      <p className="font-medium">{selectedScript.lastRun || 'Never'}</p>
                    </div>
                  </div>

                  {selectedScript.scheduled && (
                    <div className="p-3 bg-muted rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">Scheduled</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cron: {selectedScript.cronExpression}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="btn-elegant-primary flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Run Now
                    </Button>
                    <Button className="btn-elegant-secondary">Edit</Button>
                    <Button className="btn-elegant-secondary flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </Card>

                {/* Code Editor */}
                <Card className="p-6 card-elegant">
                  <h3 className="text-lg font-semibold mb-4">Code</h3>
                  <div className="code-block">
                    <pre>{`#!/bin/bash
# Update system packages
pkg update -y
pkg upgrade -y
echo "System updated successfully"`}</pre>
                  </div>
                </Card>

                {/* Execution History */}
                <Card className="p-6 card-elegant">
                  <h3 className="text-lg font-semibold mb-4">Execution History</h3>
                  <div className="space-y-3">
                    {[
                      { time: '2 hours ago', status: 'success', duration: '2.3s' },
                      { time: '1 day ago', status: 'success', duration: '2.1s' },
                      { time: '2 days ago', status: 'success', duration: '2.5s' },
                    ].map((execution, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{execution.time}</p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {execution.duration}
                          </p>
                        </div>
                        <span className="badge badge-accent">{execution.status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 card-elegant text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Select a script to view details</p>
                <Button
                  onClick={() => setShowNewScriptForm(true)}
                  className="btn-elegant-primary"
                >
                  Create Your First Script
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TermuxDashboard>
  );
}

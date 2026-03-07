import React, { useState } from 'react';
import { TermuxDashboard } from '@/components/TermuxDashboard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Trash2, RefreshCw } from 'lucide-react';

interface Package {
  name: string;
  version: string;
  description: string;
  installed: boolean;
  size: string;
}

export default function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<Package[]>([
    {
      name: 'python',
      version: '3.11.0',
      description: 'Python programming language',
      installed: true,
      size: '45 MB',
    },
    {
      name: 'nodejs',
      version: '20.10.0',
      description: 'JavaScript runtime environment',
      installed: true,
      size: '52 MB',
    },
    {
      name: 'git',
      version: '2.42.0',
      description: 'Version control system',
      installed: true,
      size: '8 MB',
    },
    {
      name: 'vim',
      version: '9.0.1',
      description: 'Advanced text editor',
      installed: false,
      size: '12 MB',
    },
    {
      name: 'curl',
      version: '8.4.0',
      description: 'Command-line tool for transferring data',
      installed: true,
      size: '2 MB',
    },
  ]);

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = (packageName: string) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName ? { ...pkg, installed: true } : pkg
      )
    );
  };

  const handleRemove = (packageName: string) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName ? { ...pkg, installed: false } : pkg
      )
    );
  };

  const installedCount = packages.filter((pkg) => pkg.installed).length;

  return (
    <TermuxDashboard>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Package Management</h1>
          <p className="text-muted-foreground">
            Search, install, update, and manage Termux packages
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 card-elegant">
            <p className="text-sm text-muted-foreground mb-1">Installed Packages</p>
            <p className="text-3xl font-bold">{installedCount}</p>
          </Card>
          <Card className="p-4 card-elegant">
            <p className="text-sm text-muted-foreground mb-1">Available Packages</p>
            <p className="text-3xl font-bold">{packages.length}</p>
          </Card>
          <Card className="p-4 card-elegant">
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-3xl font-bold">2h ago</p>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="p-6 card-elegant">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-elegant"
              />
            </div>
            <Button className="btn-elegant-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Update All
            </Button>
          </div>
        </Card>

        {/* Packages List */}
        <div className="space-y-3">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <Card key={pkg.name} className="p-4 card-elegant hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <span className="badge">{pkg.version}</span>
                      {pkg.installed && (
                        <span className="badge badge-accent">Installed</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pkg.description}
                    </p>
                    <p className="text-xs text-muted-foreground">Size: {pkg.size}</p>
                  </div>
                  <div className="flex gap-2">
                    {pkg.installed ? (
                      <Button
                        onClick={() => handleRemove(pkg.name)}
                        className="btn-elegant-secondary flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleInstall(pkg.name)}
                        className="btn-elegant-primary flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 card-elegant text-center">
              <p className="text-muted-foreground">No packages found matching your search</p>
            </Card>
          )}
        </div>
      </div>
    </TermuxDashboard>
  );
}

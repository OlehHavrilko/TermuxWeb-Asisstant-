import React, { useState } from 'react';
import { TermuxDashboard } from '@/components/TermuxDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, File, Folder, Plus, Upload, Trash2, Edit } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  expanded?: boolean;
  children?: FileNode[];
  size?: string;
  modified?: string;
}

const initialFileTree: FileNode[] = [
  {
    id: '1',
    name: 'home',
    type: 'folder',
    expanded: true,
    children: [
      {
        id: '1-1',
        name: 'projects',
        type: 'folder',
        expanded: false,
        children: [
          { id: '1-1-1', name: 'my-app', type: 'folder', children: [] },
          { id: '1-1-2', name: 'web-server', type: 'folder', children: [] },
        ],
      },
      {
        id: '1-2',
        name: 'documents',
        type: 'folder',
        expanded: false,
        children: [
          { id: '1-2-1', name: 'notes.txt', type: 'file', size: '2.5 KB' },
          { id: '1-2-2', name: 'readme.md', type: 'file', size: '1.2 KB' },
        ],
      },
      { id: '1-3', name: '.bashrc', type: 'file', size: '3.8 KB', modified: '2 days ago' },
      { id: '1-4', name: '.profile', type: 'file', size: '1.5 KB', modified: '1 week ago' },
    ],
  },
  {
    id: '2',
    name: 'storage',
    type: 'folder',
    expanded: false,
    children: [
      { id: '2-1', name: 'downloads', type: 'folder', children: [] },
      { id: '2-2', name: 'pictures', type: 'folder', children: [] },
    ],
  },
];

export default function FileManagerPage() {
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateTree(fileTree));
  };

  const renderFileTree = (nodes: FileNode[], depth: number = 0) => {
    return (
      <div>
        {nodes.map((node) => (
          <div key={node.id}>
            <div
              className={`flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors ${
                selectedFile === node.id ? 'bg-accent text-accent-foreground' : ''
              }`}
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
              onClick={() => {
                if (node.type === 'folder') {
                  toggleFolder(node.id);
                } else {
                  setSelectedFile(node.id);
                }
              }}
            >
              {node.type === 'folder' ? (
                <>
                  {node.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <Folder className="w-4 h-4" />
                </>
              ) : (
                <>
                  <div className="w-4" />
                  <File className="w-4 h-4" />
                </>
              )}
              <span className="flex-1 font-medium text-sm">{node.name}</span>
              {node.size && (
                <span className="text-xs text-muted-foreground">{node.size}</span>
              )}
            </div>
            {node.type === 'folder' && node.expanded && node.children && (
              renderFileTree(node.children, depth + 1)
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <TermuxDashboard>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">File Manager</h1>
          <p className="text-muted-foreground">
            Navigate and manage files in your Termux environment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Tree */}
          <Card className="lg:col-span-1 p-4 card-elegant">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Locations</h3>
              <Button className="p-1 hover:bg-muted rounded" title="New Folder">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </Card>

          {/* File Details and Actions */}
          <Card className="lg:col-span-3 p-6 card-elegant">
            {selectedFile ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">File Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">example-file.txt</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">2.5 KB</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">Text File</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modified</p>
                      <p className="font-medium">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button className="btn-elegant-primary flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button className="btn-elegant-secondary flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Download
                    </Button>
                    <Button className="btn-elegant-secondary flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="section-divider" />

                <div>
                  <h3 className="text-lg font-semibold mb-4">File Content</h3>
                  <div className="code-block">
                    <pre className="whitespace-pre-wrap break-words">
                      {`# Example file content
This is a sample text file.
You can view and edit files here.`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a file to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TermuxDashboard>
  );
}

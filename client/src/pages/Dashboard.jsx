import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import FileCard from '../components/files/FileCard';
import FileUpload from '../components/upload/FileUpload';
import ShareModal from '../components/modals/ShareModal';

// Mock data for demonstration
const MOCK_FILES = [
  { id: 1, name: "Project_Requirements.pdf", size: "2.4 MB", date: "2 mins ago", type: "pdf" },
  { id: 2, name: "Q4_Financial_Report.xlsx", size: "1.2 MB", date: "1 hour ago", type: "excel" },
  { id: 3, name: "Website_Mockups_v2.fig", size: "45 MB", date: "3 hours ago", type: "design" },
  { id: 4, name: "Client_Meeting_Notes.txt", size: "12 KB", date: "Yesterday", type: "text" },
  { id: 5, name: "profile_picture_high_res.jpg", size: "5.6 MB", date: "2 days ago", type: "image" },
  { id: 6, name: "Database_Schema.sql", size: "450 KB", date: "Last week", type: "code" },
];

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeShareFile, setActiveShareFile] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Files</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and share your documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search files..." 
            className="pl-9 border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400" 
          />
        </div>
        <div className="h-6 w-px bg-slate-200 mx-2" />
        <Button variant="ghost" size="sm" className="text-slate-600">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_FILES.map((file) => (
          <FileCard 
            key={file.id} 
            file={file} 
            onShare={() => setActiveShareFile(file)}
          />
        ))}
      </div>

      <FileUpload 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />

      <ShareModal
        isOpen={!!activeShareFile}
        onClose={() => setActiveShareFile(null)}
        file={activeShareFile}
      />
    </div>
  );
}

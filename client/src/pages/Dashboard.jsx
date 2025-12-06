import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Share2, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import FileCard from '../components/files/FileCard';
import FileUpload from '../components/upload/FileUpload';
import ShareModal from '../components/modals/ShareModal';
import { files as filesApi } from '../lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-files'); // 'my-files' | 'shared'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeShareFile, setActiveShareFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'image', 'document', 'other'

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      let data;
      if (activeTab === 'my-files') {
        data = await filesApi.list();
      } else {
        data = await filesApi.listShared();
      }
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const filteredFiles = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const ext = file.type?.toLowerCase() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      const isDoc = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(ext);
      
      let matchesType = true;
      if (filterType === 'image') matchesType = isImage;
      if (filterType === 'document') matchesType = isDoc;
      if (filterType === 'other') matchesType = !isImage && !isDoc;

      return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === 'my-files' ? 'My Files' : 'Shared with Me'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'my-files' ? 'Manage and share your documents.' : 'Files others have shared with you.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my-files')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 px-1 ${
            activeTab === 'my-files' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          My Files
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 px-1 ${
            activeTab === 'shared' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Shared with Me
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search files..." 
            className="pl-9 border-none bg-transparent focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex gap-1">
            {['all', 'image', 'document', 'other'].map(type => (
                <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                        filterType === type 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {/* File Grid */}
      {files.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                 {activeTab === 'my-files' ? (
                     <FileText className="h-8 w-8 text-indigo-200" />
                 ) : (
                     <Share2 className="h-8 w-8 text-indigo-200" />
                 )}
            </div>
            <h3 className="text-lg font-medium text-slate-900">
                {activeTab === 'my-files' ? 'No files uploaded yet' : 'No shared files'}
            </h3>
            <p className="text-slate-500 max-w-sm mt-1 mb-6">
                {activeTab === 'my-files' 
                    ? 'Upload your first file to get started and share it with others.' 
                    : 'Files shared with you by other users will appear here.'}
            </p>
            {activeTab === 'my-files' && (
                <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                </Button>
            )}
        </div>
      ) : filteredFiles.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Search className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">No results found</p>
                <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                <button 
                    onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Clear filters
                </button>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <FileCard 
              key={file.id} 
              file={file} 
              onShare={activeTab === 'my-files' ? () => setActiveShareFile(file) : undefined}
              showOwner={activeTab === 'shared'}
            />
          ))}
        </div>
      )}

      <FileUpload 
        isOpen={isUploadOpen} 
        onClose={(success) => {
           setIsUploadOpen(false);
           if (success) fetchFiles();
        }} 
      />

      <ShareModal
        isOpen={!!activeShareFile}
        onClose={() => setActiveShareFile(null)}
        file={activeShareFile}
      />
    </div>
  );
}

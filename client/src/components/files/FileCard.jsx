import React from 'react';
import { 
  FileText, 
  MoreVertical, 
  Calendar, 
  HardDrive, 
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  File,
  FileIcon
} from 'lucide-react';
import { Button } from '../ui/Button';

const getFileIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf':
    case 'document':
    case 'text':
      return FileText;
    case 'image':
    case 'jpg':
    case 'png':
      return ImageIcon;
    case 'excel':
    case 'csv':
    case 'spreadsheet':
      return FileSpreadsheet;
    case 'code':
    case 'js':
    case 'html':
      return FileCode;
    default:
      return File;
  }
};

const getIconColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf': return 'text-red-600 bg-red-50 group-hover:bg-red-100';
    case 'image': return 'text-purple-600 bg-purple-50 group-hover:bg-purple-100';
    case 'excel': return 'text-green-600 bg-green-50 group-hover:bg-green-100';
    case 'code': return 'text-blue-600 bg-blue-50 group-hover:bg-blue-100';
    default: return 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100';
  }
};

export default function FileCard({ file }) {
  const Icon = getFileIcon(file.type);
  const colorClass = getIconColor(file.type);

  return (
    <div className="group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-100">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg transition-colors ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-600">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-900 truncate" title={file.name}>
          {file.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {file.size}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {file.date}
          </span>
        </div>
      </div>
    </div>
  );
}

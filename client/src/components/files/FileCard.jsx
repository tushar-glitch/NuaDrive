import React from 'react';
import { FileText, MoreVertical, Calendar, HardDrive } from 'lucide-react';
import { Button } from '../ui/Button';

export default function FileCard({ file }) {
  return (
    <div className="group relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-100">
      <div className="flex items-start justify-between">
        <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
          <FileText className="h-6 w-6 text-indigo-600" />
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

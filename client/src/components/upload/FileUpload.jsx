import React, { useState, useRef } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { files as filesApi } from '../../lib/api';

export default function FileUpload({ isOpen, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Files">
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            multiple
          />
          <div className="flex flex-col items-center gap-2">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              <UploadCloud className={`h-8 w-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-slate-500">
              PDF, Images, Video, Audio (max 10MB)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <File className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button variant="outline" onClick={() => onClose(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button disabled={files.length === 0 || isUploading} onClick={async () => {
              setIsUploading(true);
              const formData = new FormData();
              files.forEach(file => formData.append('files', file));
              try {
                  await filesApi.upload(formData);
                  onClose(true);
              } catch (e) {
                  console.error(e);
                  alert('Upload failed');
              } finally {
                  setIsUploading(false);
              }
          }}>
            {isUploading ? 'Uploading...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

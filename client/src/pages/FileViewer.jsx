import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { File, Download, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { request } from '../lib/api';

export default function FileViewer() {
  const { uuid } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        // Use the public shared endpoint
        const data = await request(`/files/shared/${uuid}`);
        setFile(data);
      } catch (err) {
        console.error(err);
        setError('File not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) {
      fetchFile();
    }
  }, [uuid]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Oops!</h2>
        <p className="text-slate-600">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  const isImage = ['image', 'jpg', 'png', 'jpeg', 'gif'].includes(file.type?.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <File className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 truncate max-w-md">{file.name}</h1>
                    <p className="text-sm text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <a href={file.downloadUrl} download>
                <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                </Button>
            </a>
        </div>

        {/* Content Preview */}
        <div className="p-8 bg-slate-50 min-h-[400px] flex items-center justify-center">
            {isImage ? (
                <img 
                    src={file.downloadUrl} 
                    alt={file.name} 
                    className="max-h-[600px] w-auto rounded-lg shadow-lg object-contain"
                />
            ) : (
                <div className="text-center">
                     <File className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                     <p className="text-slate-500">Preview not available for this file type.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

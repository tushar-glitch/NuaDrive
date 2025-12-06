import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { File, Download, AlertCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { request } from '../lib/api';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function FileViewer({ mode = 'protected' }) {
  const { uuid, token } = useParams();
  const identifier = mode === 'public' ? token : uuid;
  
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetContent, setSheetContent] = useState([]);

  useEffect(() => {
    const fetchFile = async () => {
      // Determine endpoints based on mode
      const baseEndpoint = mode === 'public' ? '/files/public' : '/files/protected';

      try {
        const data = await request(`${baseEndpoint}/${identifier}`);
        setFile(data);

        // Check for CSV or Excel types
        const type = data.type?.toLowerCase();
        const isExcel = ['xlsx', 'xls', 'excel', 'spreadsheet'].includes(type);
        const isCsv = type === 'csv';

        if (isCsv || isExcel) {
            try {
                // Use proxy endpoint
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const contentUrl = `${apiUrl}${baseEndpoint}/${identifier}/content`;
                
                const response = await fetch(contentUrl, { credentials: 'include' });
                
                if (isExcel) {
                    const blob = await response.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    setSheetContent(jsonData.slice(0, 50));
                } else {
                    const text = await response.text();
                    const rows = text.split('\n').map(row => row.split(','));
                    setSheetContent(rows.slice(0, 50));
                }
            } catch (e) {
                console.error("Failed to parse spreadsheet", e);
            }
        }
      } catch (err) {
        console.error(err);
        if (err.status === 410) {
            setError('This shared link has expired.');
            return;
        }
        if (err.status === 401 || err.message?.includes('401')) {
            window.location.href = '/login'; 
            return;
        }
        setError('File not found or access denied.');
      } finally {
        setIsLoading(false);
      }
    };

    if (identifier) {
      fetchFile();
    }
  }, [identifier, mode]);

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
  const isSheet = ['csv', 'xlsx', 'xls', 'excel', 'spreadsheet'].includes(file.type?.toLowerCase());

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
            <Button onClick={() => {
                toast.success('Download started');
                window.location.href = file.downloadUrl;
            }}>
                <Download className="h-4 w-4 mr-2" />
                Download
            </Button>
        </div>

        {/* Content Preview */}
        <div className="p-8 bg-slate-50 min-h-[400px] flex items-center justify-center overflow-auto">
            {isImage ? (
                <img 
                    src={file.previewUrl} 
                    alt={file.name} 
                    className="max-h-[600px] w-auto rounded-lg shadow-lg object-contain"
                />
            ) : file.type?.toLowerCase() === 'pdf' ? (
                <iframe 
                    src={file.previewUrl} 
                    className="w-full h-[800px] rounded-lg shadow-sm border border-slate-200"
                    title="PDF Preview"
                />
            ) : isSheet ? (
                <div className="w-full max-h-[600px] overflow-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200">
                        <tbody className="divide-y divide-slate-200">
                            {sheetContent.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex === 0 ? "bg-slate-50 font-semibold" : ""}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 text-sm text-slate-700 whitespace-nowrap border-r border-slate-100 last:border-0">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sheetContent.length === 0 && <p className="p-4 text-center text-slate-500">Empty or Loading Spreadsheet</p>}
                </div>
            ) : (
                <div className="text-center">
                     <File className="h-24 w-24 text-slate-300 mx-auto mb-4" />
                     <p className="text-slate-500 font-medium">Preview not available for this file type.</p>
                     <p className="text-slate-400 text-sm mt-1">Only Image, PDF, Excel and CSV previews are currently supported.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

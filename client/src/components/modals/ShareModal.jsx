import React, { useState, useEffect } from 'react';
import { Copy, Check, UserPlus, Link as LinkIcon, Globe, ShieldAlert, CalendarClock, Eye, Settings, Activity, Loader } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { request, files } from '../../lib/api';

export default function ShareModal({ isOpen, onClose, file }) {
  const [activeTab, setActiveTab] = useState('share');
  
  // Share Tab States
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Activity Tab States
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Reset tab on open
        setActiveTab('share');
    }
  }, [isOpen]);

  // Load Expiry
  useEffect(() => {
    if (file?.link_expires_at) {
        const date = new Date(file.link_expires_at);
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setLinkExpiry(localIso);
    } else {
        setLinkExpiry('');
    }
  }, [file]);

  // Load Logs
  useEffect(() => {
      if (isOpen && activeTab === 'activity' && file) {
          const fetchLogs = async () => {
              setIsLoadingLogs(true);
              try {
                  const data = await request(`/files/${file.id}/activity`);
                  setLogs(data);
              } catch (error) {
                  console.error('Failed to load logs', error);
                  toast.error('Failed to load activity logs');
              } finally {
                  setIsLoadingLogs(false);
              }
          };
          fetchLogs();
      }
  }, [isOpen, activeTab, file]);

  const shareUrl = file?.public_token 
    ? `${window.location.origin}/s/${file.public_token}` 
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateLinkExpiry = async () => {
      setIsUpdatingSettings(true);
      try {
          await files.updateSettings(file.id, {
              linkExpiresAt: linkExpiry || null
          });
          toast.success('Link expiration updated');
      } catch (error) {
          toast.error('Failed to update settings');
      } finally {
          setIsUpdatingSettings(false);
      }
  };

  const handleInvite = async () => {
      if (!email) return;
      setIsSending(true);
      try {
          await request(`/files/${file.id}/share`, {
              method: 'POST',
              body: JSON.stringify({ email, expiresAt: null })
          });
          toast.success(`Invite sent to ${email}`);
          setEmail('');
      } catch (error) {
          toast.error(error.message);
      } finally {
          setIsSending(false);
      }
  };

  const getActionIcon = (action) => {
      switch (action) {
          case 'view': return <Eye className="h-4 w-4 text-blue-500" />;
          case 'share': return <UserPlus className="h-4 w-4 text-green-500" />;
          case 'update_settings': return <Settings className="h-4 w-4 text-amber-500" />;
          default: return <Activity className="h-4 w-4 text-slate-500" />;
      }
  };

  const formatLogMessage = (log) => {
      const actor = log.user_id === null ? 'Anonymous User' : (log.user_name || 'User'); // We don't have 'You' check easily here unless we pass currentUser prop, but user_name handles it if DB join worked.
      // Ideally backend returns 'You' or we check against auth context. For now, rely on user_name.
      
      switch (log.action) {
          case 'view': return `${actor} viewed this file`;
          case 'share': return `${actor} shared this file`;
          case 'update_settings': return `${actor} updated settings`;
          default: return `${actor} performed ${log.action}`;
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage "${file?.name || 'File'}"`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button 
            onClick={() => setActiveTab('share')} 
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'share' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Share
        </button>
        <button 
            onClick={() => setActiveTab('activity')} 
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Activity
        </button>
      </div>

      {activeTab === 'share' ? (
          <div className="space-y-8">
            {/* Share via Link */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-indigo-600" />
                        Shareable Link
                    </Label>
                    {file?.link_expires_at && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            Expires {new Date(file.link_expires_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <Input readOnly value={shareUrl} className="bg-slate-50 text-slate-500 font-mono text-xs" />
                    <Button variant="outline" onClick={handleCopyLink} className="shrink-0 w-24">
                        {copied ? <> <Check className="h-4 w-4 mr-2" /> Copied </> : <> <Copy className="h-4 w-4 mr-2" /> Copy </>}
                    </Button>
                </div>

                {/* Expiry Settings */}
                <div className="flex items-end gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-full">
                        <Label className="text-xs text-slate-500 mb-1 block">Link Expiration (Optional)</Label>
                        <Input type="datetime-local" value={linkExpiry} onChange={(e) => setLinkExpiry(e.target.value)} className="bg-white text-sm" />
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleUpdateLinkExpiry} disabled={isUpdatingSettings} className="mb-[1px]">
                        {isUpdatingSettings ? 'Saving...' : 'Update'}
                    </Button>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Anyone with this link can view the file unless expired.
                </p>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or share with people</span></div>
            </div>

            {/* Invite People */}
            <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-indigo-600" />
                    Invite People
                </Label>
                <div className="flex gap-2">
                    <Input placeholder="Enter email address..." value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
                    <Button onClick={handleInvite} disabled={!email || isSending} className="shrink-0">
                        {isSending ? 'Sending...' : 'Send Invite'}
                    </Button>
                </div>
            </div>
          </div>
      ) : (

          <div className="h-[400px] flex flex-col relative">
              {isLoadingLogs ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
              ) : logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
                        <Activity className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900">No activity yet</p>
                      <p className="text-xs text-slate-400 mt-1">Views, downloads, and shares will appear here</p>
                  </div>
              ) : (
                  <div className="overflow-y-auto flex-1 pr-4 -mr-4 pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="relative border-l border-slate-200 ml-3 space-y-8 pl-6 py-1">
                          {logs.map((log) => (
                              <div key={log.id} className="relative group">
                                  <div className="absolute -left-[33px] bg-white p-1.5 rounded-full border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:scale-110 transition-all">
                                      {getActionIcon(log.action)}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-900">{formatLogMessage(log)}</p>
                                      {log.details && <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>}
                                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-medium">
                                          {new Date(log.created_at).toLocaleString(undefined, { 
                                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                          })}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </Modal>
  );
}

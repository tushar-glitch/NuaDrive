import React, { useState, useEffect } from 'react';
import { Copy, Check, UserPlus, Link as LinkIcon, Globe, ShieldAlert, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { request, files } from '../../lib/api';

export default function ShareModal({ isOpen, onClose, file }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Expiry States
  const [linkExpiry, setLinkExpiry] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    if (file?.link_expires_at) {
        // Format for datetime-local: YYYY-MM-DDThh:mm
        const date = new Date(file.link_expires_at);
        // Adjust to local ISO string somewhat hackily or use a library. 
        // Simple hack:
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setLinkExpiry(localIso);
    } else {
        setLinkExpiry('');
    }
  }, [file]);

  // Use public token for sharing
  const shareUrl = file?.public_token 
    ? `${window.location.origin}/s/${file.public_token}` 
    : ''; // Fallback or empty if not loaded yet

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
              linkExpiresAt: linkExpiry || null // Send null if empty
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
              body: JSON.stringify({ 
                  email,
                  expiresAt: null
              })
          });
          toast.success(`Invite sent to ${email}`);
          setEmail('');
      } catch (error) {
          toast.error(error.message);
      } finally {
          setIsSending(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${file?.name || 'File'}"`}>
      <div className="space-y-8">
        
        {/* Share via Link Section */}
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
                <Input 
                    readOnly 
                    value={shareUrl}
                    className="bg-slate-50 text-slate-500 font-mono text-xs"
                />
                <Button variant="outline" onClick={handleCopyLink} className="shrink-0 w-24">
                    {copied ? (
                        <> <Check className="h-4 w-4 mr-2" /> Copied </>
                    ) : (
                        <> <Copy className="h-4 w-4 mr-2" /> Copy </>
                    )}
                </Button>
            </div>

            {/* Link Expiry Settings */}
            <div className="flex items-end gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-full">
                    <Label className="text-xs text-slate-500 mb-1 block">Link Expiration (Optional)</Label>
                    <Input 
                        type="datetime-local" 
                        value={linkExpiry}
                        onChange={(e) => setLinkExpiry(e.target.value)}
                        className="bg-white text-sm"
                    />
                </div>
                <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleUpdateLinkExpiry}
                    disabled={isUpdatingSettings}
                    className="mb-[1px]"
                >
                    {isUpdatingSettings ? 'Saving...' : 'Update'}
                </Button>
            </div>

             <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Anyone with this link can view the file unless expired.
            </p>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or share with people</span>
            </div>
        </div>

        {/* Share with People Section */}
        <div className="space-y-4">
             <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                Invite People
            </Label>
            
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter email address..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                />
                <Button onClick={handleInvite} disabled={!email || isSending} className="shrink-0">
                    {isSending ? 'Sending...' : 'Send Invite'}
                </Button>
            </div>
        </div>
      </div>
    </Modal>
  );
}

import React, { useState } from 'react';
import { Copy, Check, UserPlus, Link as LinkIcon, Globe, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { request } from '../../lib/api';

export default function ShareModal({ isOpen, onClose, file }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const shareUrl = file ? `${window.location.origin}/file/${file.uuid}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
      if (!email) return;
      setIsSending(true);
      try {
          await request(`/files/${file.id}/share`, {
              method: 'POST',
              body: JSON.stringify({ email })
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
      <div className="space-y-6">
        
        {/* Share via Link Section */}
        <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-indigo-600" />
                Shareable Link
            </Label>
            <div className="flex gap-2">
                <Input 
                    readOnly 
                    value={shareUrl}
                    className="bg-slate-50 text-slate-500 font-mono text-xs"
                />
                <Button variant="outline" onClick={handleCopyLink} className="shrink-0 w-24">
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 mr-2" /> 
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                        </>
                    )}
                </Button>
            </div>
             <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Anyone with this link can view the file.
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
        <div className="space-y-3">
             <Label className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                Invite People
            </Label>
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter email address..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleInvite} disabled={!email || isSending}>
                    {isSending ? 'Sending...' : 'Send Invite'}
                </Button>
            </div>
        </div>
      </div>
    </Modal>
  );
}

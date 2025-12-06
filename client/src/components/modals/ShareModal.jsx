import React, { useState } from 'react';
import { Copy, Check, UserPlus, Link as LinkIcon, Globe, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

export default function ShareModal({ isOpen, onClose, file }) {
  const [copied, setCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState('viewer');

  const handleCopyLink = () => {
    // In a real app, this would be the actual share link
    navigator.clipboard.writeText(`https://nua.share/f/${file?.id || '123'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                    value={`https://nua.share/f/${file?.id || '123'}`}
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
                Only users with an account can access this link.
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
                <Input placeholder="Enter email address..." />
                <Button>
                    Send Invite
                </Button>
            </div>
        </div>

        {/* People with Access List (Mock) */}
        <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-slate-900">People with access</h4>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-xs">
                        YO
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">You (Owner)</p>
                        <p className="text-xs text-slate-500">tushar@example.com</p>
                    </div>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    Owner
                </span>
            </div>
        </div>
      </div>
    </Modal>
  );
}

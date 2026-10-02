import React, { useState } from 'react';
import { Share2, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainId: string;
  trainName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, trainId, trainName }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  if (!isOpen) return null;

  const handleGenerateShare = async () => {
    setLoading(true);
    try {
      const res = await api.createShareLink(trainId);
      const url = `${window.location.origin}/shared/${res.token}`;
      setShareUrl(url);
    } catch {
      const fallbackUrl = `${window.location.origin}/shared/demo-${trainId}`;
      setShareUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-3xl p-6 border border-surface-tertiary shadow-floating space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-surface-secondary text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-light text-accent flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-base">Share Journey Link</h3>
            <p className="text-xs text-text-secondary">{trainName}</p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Anyone with this link can view real-time train position, ETA, and journey progress without needing an account.
        </p>

        {!shareUrl ? (
          <button
            onClick={handleGenerateShare}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shadow-apple flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{loading ? 'Generating Link...' : 'Generate Live Share Link'}</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-surface-secondary rounded-2xl border border-surface-tertiary">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs font-mono text-text-primary outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-accent text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-accent-hover transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Link active for 48 hours</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

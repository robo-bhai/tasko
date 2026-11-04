import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { Store } from '../services/store';

interface ResetPasswordModalProps {
  token: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPasswordResetSuccess?: (email: string) => void;
  lang?: Language;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  token,
  isOpen,
  onClose,
  onPasswordResetSuccess,
  lang = 'ur'
}) => {
  const isUrdu = lang === 'ur';

  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Verify token on mount or token change
  useEffect(() => {
    if (!token || !isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage('');
    setTokenError('');

    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        setIsLoading(false);
        if (data.valid) {
          setIsValidToken(true);
          setUserEmail(data.email || '');
          setUserName(data.name || 'Valued User');
          setRemainingSeconds(data.remainingSeconds ?? 300);
        } else {
          setIsValidToken(false);
          setTokenError(
            data.error || 
            (isUrdu 
              ? 'Password reset link expire ho chuka hai ya na-manzoor hai.' 
              : 'Password reset link is invalid or has expired.')
          );
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setIsLoading(false);
        setIsValidToken(false);
        setTokenError(err.message || 'Token verification failed');
      });

    return () => {
      isMounted = false;
    };
  }, [token, isOpen, isUrdu]);

  // Live 5-minute countdown timer
  useEffect(() => {
    if (!isValidToken || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsValidToken(false);
          setTokenError(
            isUrdu 
              ? '5 minutes ka waqt khatam ho chuka hai! Yeh link expire ho gaya hai.' 
              : '5-minute time window expired! Please request a new link.'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isValidToken, remainingSeconds, isUrdu]);

  if (!isOpen || !token) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 6) {
      setErrorMessage(
        isUrdu 
          ? 'Naya password kam az kam 6 characters ka hona chahiye.' 
          : 'New password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        isUrdu 
          ? 'Dono passwords match nahi kar rahe.' 
          : 'Passwords do not match.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to update password');
        return;
      }

      setSuccessMessage(
        isUrdu 
          ? 'Shabash! Aapka password kamyabi se update ho chuka hai.' 
          : 'Success! Your password has been updated successfully.'
      );

      // Update client store, localStorage, and Firestore with new password immediately
      const targetEmail = data.email || userEmail;
      if (targetEmail) {
        Store.updateUserPassword(targetEmail, newPassword);
      }

      setTimeout(() => {
        // Clean URL query param
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('resetToken');
          window.history.replaceState({}, '', url.pathname + url.search);
        }
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(userEmail);
        }
        onClose();
      }, 1500);

    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Error communicating with server');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f1118] text-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-amber-500/40 overflow-hidden relative">
        {/* Top Accent Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Header */}
        <div className="p-4 sm:p-6 pb-2 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isUrdu ? 'Naya Password Set Karein' : 'Set New Password'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isUrdu ? 'Khanewal Connect Mehfooz Access' : 'Secure Account Recovery'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 pt-2">
          {isLoading && (
            <div className="py-10 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                {isUrdu ? 'Security link tasdeeq ho raha hai...' : 'Verifying reset link security...'}
              </p>
            </div>
          )}

          {!isLoading && isValidToken === false && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-red-300">
                  {isUrdu ? 'Link Expire Ho Chuka Hai' : 'Link Invalid or Expired'}
                </h4>
                <p className="text-xs text-slate-400 px-4">
                  {tokenError || (isUrdu ? 'Yeh link 5 minute se ziada purana hai ya pehle use ho chuka hai.' : 'This reset link has expired after 5 minutes.')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'Band Karein (Naya Link Request Karein)' : 'Close & Request New Link'}
              </button>
            </div>
          )}

          {!isLoading && isValidToken && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 5-Minute Timer Warning Badge */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span className="text-xs text-amber-300 font-semibold">
                    {isUrdu ? 'Link Baqi Waqt:' : 'Link Expiry:'}
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40">
                  {timeFormatted}
                </span>
              </div>

              {userEmail && (
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'Account Email:' : 'Account:'}</span>
                  <span className="font-mono text-amber-300 font-bold">{userEmail}</span>
                </div>
              )}

              {/* Error / Success messages */}
              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Password fields */}
              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1.5">
                  {isUrdu ? 'Naya Password (New Password)' : 'New Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-white pl-9 pr-10 py-2.5 focus:border-amber-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold mb-1.5">
                  {isUrdu ? 'Naya Password Dobara Darj Karein' : 'Confirm New Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-white pl-9 pr-3 py-2.5 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!successMessage}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{isUrdu ? 'Password Tabdeel Ho Raha Hai...' : 'Updating Password...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isUrdu ? 'Naya Password Confirm Karein' : 'Confirm & Save Password'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Order } from '../../types';
import { Store } from '../../services/store';
import { AlertTriangle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  order: Order;
}

/** Customer-side: approve or reject extra work. Nothing is added to the bill without approval. */
export const ExtraWorkCustomerCard: React.FC<Props> = ({ order }) => {
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const quotes = order.extraWork || [];
  if (quotes.length === 0) return null;
  const pending = quotes.find(q => q.status === 'pending');
  const history = quotes.filter(q => q.status !== 'pending');
  const open = order.status !== 'completed' && order.status !== 'cancelled';

  const respond = async (decision: 'approve' | 'reject') => {
    if (!pending) return;
    setError('');
    setBusy(decision);
    const result = await Store.respondExtraWork(order.id, pending.id, decision, note.trim() || undefined);
    setBusy(null);
    if (!result.success) setError(result.error || 'Jawab nahi bheja ja saka.');
    else setNote('');
  };

  return (
    <div className="space-y-2.5">
      {pending && open && (
        <div className="p-4 rounded-2xl border border-amber-400/60 bg-amber-500/10 space-y-3 text-white shadow-md">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-300">Extra kaam ke liye aap ki manzoori darkar hai</p>
              <p className="text-xs text-slate-300">
                {pending.requestedByName} kehte hain: <strong className="text-white">{pending.description}</strong>
              </p>
              <p className="text-sm font-mono font-bold text-amber-400">
                Extra raqam: PKR {pending.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400">
                Reject karne par aap se sirf original charges (visit + equipment) liye jayenge.
              </p>
            </div>
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Note (optional)"
            className="w-full text-xs rounded-lg border border-slate-700 px-3 py-2 bg-slate-900 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
          {error && <p className="text-[11px] font-semibold text-rose-400">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond('reject')}
              className="flex-1 px-3 py-2 rounded-xl border border-rose-500/60 text-rose-300 hover:bg-rose-950/40 disabled:opacity-60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {busy === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Reject
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => respond('approve')}
              className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {busy === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Approve (PKR {pending.amount.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-3 rounded-xl bg-[#12141e] border border-slate-800 space-y-1.5 text-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Extra Kaam (Is order par)</p>
          {history.map(q => (
            <div key={q.id} className="flex items-start justify-between gap-2">
              <span className="text-slate-300">{q.description}</span>
              <span className={`font-mono font-bold shrink-0 ${q.status === 'approved' ? 'text-emerald-400' : 'text-rose-400 line-through'}`}>
                PKR {q.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

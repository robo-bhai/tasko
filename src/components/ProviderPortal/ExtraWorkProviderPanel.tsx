import React, { useState } from 'react';
import { Order } from '../../types';
import { Store } from '../../services/store';
import { PlusCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Props {
  order: Order;
}

const badge = (status: string) => {
  if (status === 'approved')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" />Approved</span>;
  if (status === 'rejected')
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Rejected</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Customer ke jawab ka intezar</span>;
};

/** Provider-side: send an extra-work quote. Only the provider assigned to this job sees this. */
export const ExtraWorkProviderPanel: React.FC<Props> = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const quotes = order.extraWork || [];
  const pending = quotes.some(q => q.status === 'pending');
  const canQuote = ['assigned', 'on_the_way', 'work_started'].includes(order.status) && !pending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amt = Math.round(Number(amount));
    if (description.trim().length < 5) {
      setError('Extra kaam ki tafseel likhein (kam az kam 5 harf).');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Sahi raqam (PKR) likhein.');
      return;
    }
    setBusy(true);
    const result = await Store.requestExtraWork(order.id, description.trim(), amt);
    setBusy(false);
    if (!result.success) {
      setError(result.error || 'Quote nahi bheja ja saka.');
      return;
    }
    setDescription('');
    setAmount('');
    setOpen(false);
  };

  return (
    <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h5 className="font-bold text-amber-950 text-xs uppercase tracking-wider">
          Extra Kaam / Extra Charges
        </h5>
        {canQuote && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Extra Quote Bhejein
          </button>
        )}
      </div>

      <p className="text-[11px] text-amber-900/80 leading-relaxed">
        Agar kaam booking se zyada nikle to pehle yahan quote bhejein. Customer approve kare tabhi extra raqam bill mein jaye gi. Customer ki manzoori ke baghair extra paise talab na karein.
      </p>

      {pending && (
        <p className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2">
          Aap ka quote customer ke paas hai. Jab tak customer jawab na de, job complete nahi ho sakti.
        </p>
      )}

      {open && canQuote && (
        <form onSubmit={submit} className="space-y-2.5 bg-white border border-amber-200 rounded-xl p-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Extra kaam kya hai? *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={2}
              placeholder="Misaal: Pipe bohat purani hai, 6 feet naya pipe aur fittings lagani paren gi"
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Extra raqam (PKR) *</label>
            <input
              type="number"
              min={1}
              step={50}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1200"
              className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-hidden focus:border-amber-500"
            />
          </div>
          {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(''); }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Customer Ko Bhejein
            </button>
          </div>
        </form>
      )}

      {quotes.length > 0 && (
        <ul className="space-y-2">
          {quotes.map(q => (
            <li key={q.id} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-900">PKR {q.amount.toLocaleString()}</span>
                {badge(q.status)}
              </div>
              <p className="text-slate-600">{q.description}</p>
              {q.responseNote && <p className="text-slate-500 italic">Customer: "{q.responseNote}"</p>}
            </li>
          ))}
        </ul>
      )}

      {(order.extraWorkTotal || 0) > 0 && (
        <p className="text-[11px] font-bold text-emerald-700">
          Approved extra: PKR {(order.extraWorkTotal || 0).toLocaleString()} &bull; Naya total: PKR {order.pricing.total.toLocaleString()}
        </p>
      )}
    </div>
  );
};

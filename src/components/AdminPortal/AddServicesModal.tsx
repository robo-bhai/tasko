import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { HomeServiceItem, User } from '../../types';
import { CUSTOM_TEMPLATE_KEY, SERVICE_TEMPLATES, ServiceTemplate } from './serviceTemplates';

export interface NewServiceDraft {
  key: string;
  service: HomeServiceItem;
}

interface Props {
  existingServices: HomeServiceItem[];
  technicians: User[];
  onClose: () => void;
  onSubmit: (items: HomeServiceItem[]) => void;
  onCreateWorker: () => void;
}

interface Row {
  key: string;            // template id ya CUSTOM_TEMPLATE_KEY + counter
  label: string;
  name: string;
  category: string;
  rate: string;           // input string, submit par number banta hai
  duration: string;
  providerId: string;
  tpl?: ServiceTemplate;
}

const inputCls =
  'w-full text-xs rounded-lg border border-slate-700 px-2.5 py-1.5 bg-[#0a0d14] text-white focus:border-amber-400 focus:outline-hidden';

export const AddServicesModal: React.FC<Props> = ({
  existingServices,
  technicians,
  onClose,
  onSubmit,
  onCreateWorker
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const customCounter = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Bahar click par dropdown band
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const existingIds = useMemo(() => new Set(existingServices.map(s => s.id)), [existingServices]);
  const selectedKeys = useMemo(() => new Set(rows.map(r => r.key)), [rows]);

  const filteredTemplates = SERVICE_TEMPLATES.filter(t =>
    (t.label + ' ' + t.service.name + ' ' + t.service.category).toLowerCase().includes(search.trim().toLowerCase())
  );

  const toggleTemplate = (tpl: ServiceTemplate) => {
    const key = tpl.service.id;
    if (existingIds.has(key)) return;
    setError('');
    setRows(prev =>
      prev.some(r => r.key === key)
        ? prev.filter(r => r.key !== key)
        : [
            ...prev,
            {
              key,
              label: tpl.label,
              name: tpl.service.name,
              category: tpl.service.category,
              rate: String(tpl.service.basePrice),
              duration: tpl.service.estimatedDuration,
              providerId: '',
              tpl
            }
          ]
    );
  };

  const addCustom = () => {
    customCounter.current += 1;
    setError('');
    setRows(prev => [
      ...prev,
      {
        key: `${CUSTOM_TEMPLATE_KEY}${customCounter.current}`,
        label: 'Custom Service',
        name: '',
        category: 'Other',
        rate: '1000',
        duration: '60 mins',
        providerId: ''
      }
    ]);
    setOpen(false);
  };

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => setRows(prev => prev.filter(r => r.key !== key));

  // Worker list: jin ki skill service se match kare unhein upar rakho
  const sortedTechniciansFor = (row: Row) => {
    const kws = row.tpl?.keywords || [];
    const score = (t: User) => {
      const skill = (t.serviceSkill || '').toLowerCase() + ' ';
      return kws.some(k => skill.includes(k)) ? 0 : 1;
    };
    return [...technicians].sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
  };
  const matchesSkill = (row: Row, t: User) => {
    const kws = row.tpl?.keywords || [];
    const skill = (t.serviceSkill || '').toLowerCase() + ' ';
    return kws.some(k => skill.includes(k));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      setError('Pehle dropdown se kam az kam ek service select karein.');
      return;
    }
    const stamp = Date.now();
    const out: HomeServiceItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rate = Number(r.rate);
      if (!r.name.trim()) {
        setError('Custom service ka naam likhna zaroori hai.');
        return;
      }
      if (!Number.isFinite(rate) || rate <= 0) {
        setError(`"${r.name || r.label}" ka rate (PKR) sahi likhein.`);
        return;
      }
      const provider = technicians.find(t => t.id === r.providerId);
      const item: HomeServiceItem = r.tpl
        ? { ...r.tpl.service }
        : {
            id: `srv-custom-${stamp}-${i}`,
            name: r.name.trim(),
            category: r.category.trim() || 'Other',
            basePrice: rate,
            estimatedDuration: r.duration.trim() || '60 mins',
            description: `${r.name.trim()} - professional home service at your doorstep.`,
            popularIssues: ['General repair', 'Installation', 'Inspection / checkup'],
            icon: 'Hammer',
            isPublished: true
          };
      item.basePrice = rate;
      item.estimatedDuration = r.duration.trim() || item.estimatedDuration;
      if (provider) {
        item.assignedProviderId = provider.id;
        item.assignedProviderName = provider.name;
        item.isPublished = true; // worker assign => customer store par live
      } else {
        item.isPublished = false; // worker ke baghair hidden (existing rule)
      }
      out.push(item);
    }
    onSubmit(out);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b0f19] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-500/50 space-y-4 my-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div>
            <h4 className="font-bold text-white text-base">Nayi Home Service(s) Shamil Karein</h4>
            <p className="text-xs text-amber-400">
              Dropdown se ek ya zyada services chunein, phir har ek ka rate aur worker set karein
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* MULTI-SELECT DROPDOWN */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-amber-400 font-bold mb-1">Services Select Karein *</label>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-700 hover:border-amber-400 px-3 py-2.5 bg-[#0a0d14] text-left cursor-pointer"
            >
              <span className={rows.length ? 'text-white font-semibold' : 'text-slate-400'}>
                {rows.length
                  ? `${rows.length} service(s) selected`
                  : '-- Electrician, Plumber, AC Repair ... chunein --'}
              </span>
              <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-amber-500/40 bg-[#0e111a] shadow-2xl">
                <div className="p-2 border-b border-slate-800 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Service dhoondein..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filteredTemplates.map(tpl => {
                    const already = existingIds.has(tpl.service.id);
                    const checked = selectedKeys.has(tpl.service.id);
                    return (
                      <li key={tpl.service.id}>
                        <button
                          type="button"
                          disabled={already}
                          onClick={() => toggleTemplate(tpl)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                            already
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-slate-800/70 cursor-pointer'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              checked ? 'bg-amber-400 border-amber-400' : 'border-slate-600'
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 text-slate-950" />}
                          </span>
                          <span className="flex-1">
                            <span className="block text-white font-semibold">{tpl.label}</span>
                            <span className="block text-[10px] text-slate-500">{tpl.service.category}</span>
                          </span>
                          {already ? (
                            <span className="text-[10px] text-emerald-400">Pehle se maujood</span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">PKR {tpl.service.basePrice}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  {filteredTemplates.length === 0 && (
                    <li className="px-3 py-3 text-slate-500">Koi service nahi mili.</li>
                  )}
                </ul>
                <button
                  type="button"
                  onClick={addCustom}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-slate-800 text-amber-400 font-bold hover:bg-slate-800/70 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Other / Apni marzi ki service likhein</span>
                </button>
              </div>
            )}
          </div>

          {/* SELECTED SERVICES: RATE + WORKER */}
          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-slate-500">
              Abhi koi service select nahi hui.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map(row => (
                <div key={row.key} className="rounded-2xl border border-slate-800 bg-[#0e111a] p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {row.tpl ? (
                        <>
                          <span className="block text-sm font-bold text-white">{row.label}</span>
                          <span className="text-[10px] text-slate-500">{row.name} · {row.category}</span>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Service ka naam *</label>
                            <input
                              value={row.name}
                              onChange={e => updateRow(row.key, { name: e.target.value })}
                              placeholder="e.g. Generator Repair"
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Category</label>
                            <input
                              value={row.category}
                              onChange={e => updateRow(row.key, { category: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                      title="Hata dein"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Starting Rate (PKR) *</label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={row.rate}
                        onChange={e => updateRow(row.key, { rate: e.target.value })}
                        className={inputCls + ' font-mono font-bold'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Waqt (Duration)</label>
                      <input
                        value={row.duration}
                        onChange={e => updateRow(row.key, { duration: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Worker Assign Karein</label>
                      <select
                        value={row.providerId}
                        onChange={e => updateRow(row.key, { providerId: e.target.value })}
                        className={inputCls}
                      >
                        <option value="">-- Abhi nahi (Hidden rahe gi) --</option>
                        {sortedTechniciansFor(row).map(t => (
                          <option key={t.id} value={t.id}>
                            {matchesSkill(row, t) ? '★ ' : ''}{t.name} ({t.phone}) - {t.serviceSkill || 'Technician'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!row.providerId && (
                    <p className="text-[10px] text-amber-400">
                      Worker assign karne par service customer store par foran live ho jaye gi.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCreateWorker}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              + Naya Worker Shamil Karein
            </button>
            <span className="text-[10px] text-slate-500">{technicians.length} technicians dastyab</span>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300">{error}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{rows.length > 1 ? `${rows.length} Services Add Karein` : 'Service Add Karein'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

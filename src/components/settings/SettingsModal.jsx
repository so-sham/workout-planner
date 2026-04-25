/**
 * @module components/settings/SettingsModal
 * @description Application settings modal.
 * Allows the user to configure their Anthropic API key,
 * toggle offline coach mode, and wipe all local data.
 *
 * @param {Object} props
 * @param {Object} props.settings - Current settings
 * @param {Function} props.setSettings - Settings updater
 * @param {Function} props.onClose - Called to dismiss the modal
 * @param {Function} props.showToast - Toast notification function
 * @param {Function} props.bumpRefresh - Refresh counter incrementer
 * @returns {JSX.Element}
 */
import { useState } from 'react';
import { DEFAULT_SETTINGS } from '../../utils/storage';
import Icon from '../Icon';

export default function SettingsModal({ settings, setSettings, onClose, showToast, bumpRefresh }) {
  const [draft, setDraft] = useState(settings);

  /** @param {Object} p - Partial patch for the draft */
  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  /** Save the draft to settings and close */
  const save = () => { setSettings(draft); onClose(); showToast("Settings saved"); };

  /** Wipe ALL local data (workouts, plans, PRs, settings) after confirmation */
  const wipeAll = () => {
    if (!confirm("Wipe ALL local data? Workouts, plans, PRs, settings.")) return;
    for (const k of window.storage.keys()) window.storage.removeItem(k);
    setSettings({ ...DEFAULT_SETTINGS });
    bumpRefresh();
    onClose();
    showToast("All data wiped");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-gold/30 bg-carbon shadow-gold my-4">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="display text-2xl text-white">Settings</div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-2 hover:bg-white/5">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        {/* Settings form */}
        <div className="p-4 space-y-4">
          <label className="block">
            <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Anthropic API Key</span>
            <input
              type="password"
              value={draft.apiKey || ""}
              onChange={(e) => patch({ apiKey: e.target.value })}
              placeholder="sk-ant-…"
              className="w-full rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:border-gold/60"
            />
            <span className="block text-[11px] text-zinc-500 mt-1">Optional — without a key, the app uses the built-in offline coach.</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={!!draft.preferLocalCoach}
              onChange={(e) => patch({ preferLocalCoach: e.target.checked })}
            />
            Force offline coach (skip the API)
          </label>
          <div className="flex justify-between gap-2 pt-2 border-t border-white/10">
            <button onClick={wipeAll} className="rounded-md border border-ember/40 text-ember px-3 py-1.5 text-xs font-bold hover:bg-ember/10">Wipe data</button>
            <button onClick={save} className="rounded-md bg-gradient-to-r from-gold to-goldbright text-ink px-3 py-1.5 text-sm font-bold">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

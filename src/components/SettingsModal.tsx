import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Save, Image as ImageIcon, Sliders, ExternalLink } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { translations } from '../utils/translations';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, currentUser } = useProducts();
  const t = translations[settings.language];
  const isAr = settings.language === 'ar';
  const isAdmin = currentUser.role === 'admin';

  const [form, setForm] = useState<AppSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <span className="p-2 rounded-lg bg-ymco-50 dark:bg-ymco-950/50 text-ymco-primary border border-ymco-200 dark:border-ymco-800">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.settingsTitle}
              </h2>
              <span className="text-xs text-slate-500">Global System Preferences & Corporate Identity</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
          
          {/* Logo Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Active Corporate Logo Asset
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'emblem', label: 'Official 3D Emblem', src: './images/logos/ymco-emblem.jpg' },
                { id: 'pill', label: 'Transparent Pill Logo', src: './images/logos/ymco-pill-logo.png' },
                { id: 'banner', label: 'Corporate Banner', src: './images/logos/ymco-banner-logo.webp' }
              ].map((logo) => (
                <button
                  type="button"
                  key={logo.id}
                  onClick={() => setForm({ ...form, logoType: logo.id as any })}
                  className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                    form.logoType === logo.id
                      ? 'border-ymco-primary bg-ymco-50/50 dark:bg-ymco-950/30 ring-2 ring-ymco-primary/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <img src={logo.src} alt={logo.label} className="h-10 w-auto object-contain mb-2" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {logo.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name (English)
              </label>
              <input
                type="text"
                value={form.companyNameEn}
                onChange={(e) => setForm({ ...form, companyNameEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الشركة (العربية)
              </label>
              <input
                type="text"
                value={form.companyNameAr}
                onChange={(e) => setForm({ ...form, companyNameAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Application Title (English)
              </label>
              <input
                type="text"
                value={form.appTitleEn}
                onChange={(e) => setForm({ ...form, appTitleEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان التطبيق (العربية)
              </label>
              <input
                type="text"
                value={form.appTitleAr}
                onChange={(e) => setForm({ ...form, appTitleAr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Table Density & Renumbering */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Table Density
              </label>
              <select
                value={form.tableDensity}
                onChange={(e) => setForm({ ...form, tableDensity: e.target.value as any })}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                <option value="compact">Compact (Optimized for hundreds of rows)</option>
                <option value="comfortable">Comfortable (Larger row heights)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoRenumberOnReorder}
                  onChange={(e) => setForm({ ...form, autoRenumberOnReorder: e.target.checked })}
                  className="rounded text-ymco-primary focus:ring-ymco-primary w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Auto-renumber 1..N after reordering rows
                </span>
              </label>
            </div>
          </div>

          {/* PDF Customization */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Default PDF Document Metadata
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Default Reference No.</label>
                <input
                  type="text"
                  value={form.pdfRefNumber}
                  onChange={(e) => setForm({ ...form, pdfRefNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Default Prepared By</label>
                <input
                  type="text"
                  value={form.pdfPreparedBy}
                  onChange={(e) => setForm({ ...form, pdfPreparedBy: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Platform Engineering & Attribution */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {isAr ? 'هندسة وبرمجة المنصة' : 'Platform Engineering & Architecture'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr ? 'المهندس ضياء الحميري • Lead Architect & Full-Stack Engineer' : 'Eng. Dhiaa Al-Himyari • Lead Architect & Full-Stack Engineer'}
              </span>
            </div>
            <a
              href="https://en-dhiaa.surge.sh/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark transition-colors shadow-xs"
            >
              <span>{isAr ? 'معرض الأعمال' : 'Portfolio'}</span>
              <ExternalLink className="w-3 h-3 ml-1 rtl:mr-1 rtl:ml-0" />
            </a>
          </div>

          {/* Save CTA */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-ymco-primary hover:bg-ymco-dark rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              <span>{t.saveSettings}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


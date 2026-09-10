import { useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import { generateStandaloneIndexHtml } from '../utils/standaloneHtmlGenerator';

interface StandaloneExportModalProps {
  onClose: () => void;
}

export function StandaloneExportModal({ onClose }: StandaloneExportModalProps) {
  const [copied, setCopied] = useState(false);
  const standaloneHtml = generateStandaloneIndexHtml();

  const handleCopy = () => {
    navigator.clipboard.writeText(standaloneHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([standaloneHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
              GitHub Pages Ready
            </span>
            <h3 className="text-base font-black text-slate-900">
              Archivo index.html Autónomo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 text-xs text-slate-600 space-y-2">
          <p>
            Este archivo contiene la aplicación completa empaquetada en un único <code>index.html</code> con Tailwind CSS, React 18 y Babel CDN, lista para subir a la raíz de tu repositorio y publicar en <strong>GitHub Pages</strong> sin ningún comando ni build:
          </p>
        </div>

        {/* Code Preview Box */}
        <div className="flex-1 min-h-[160px] bg-slate-900 text-slate-300 font-mono text-[11px] p-3 rounded-2xl overflow-y-auto border border-slate-800 relative">
          <pre className="whitespace-pre-wrap">{standaloneHtml.slice(0, 750)}...</pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={handleCopy}
            className="py-3 bg-sky-600 active:bg-sky-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[44px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Código'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-3 bg-slate-900 active:bg-black text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>Descargar index.html</span>
          </button>
        </div>
      </div>
    </div>
  );
}

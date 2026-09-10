import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Copy,
  Edit3,
  Flame,
  MessageCircle,
  RotateCcw,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Match, Team, TournamentConfig } from '../types';
import { formatWhatsAppSingleMatch } from '../utils/tournamentEngine';

interface SingleMatchShareModalProps {
  match: Match;
  teams: Team[];
  config: TournamentConfig;
  onClose: () => void;
  onSaveMatchPhoto?: (matchId: string, photoUrl: string | undefined) => void;
  onToast: (msg: string) => void;
}

export function SingleMatchShareModal({
  match,
  teams,
  config,
  onClose,
  onSaveMatchPhoto,
  onToast,
}: SingleMatchShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(match.photoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCustomized, setIsCustomized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const teamA = teamMap.get(match.teamAId);
  const teamB = teamMap.get(match.teamBId);
  const nameA = teamA?.name || match.placeholderA || 'Equipo A';
  const nameB = teamB?.name || match.placeholderB || 'Equipo B';

  const defaultFormattedText = useMemo(() => {
    return formatWhatsAppSingleMatch(
      match,
      teams,
      config.name,
      config.category,
      config.season
    );
  }, [match, teams, config]);

  const [messageText, setMessageText] = useState<string>(defaultFormattedText);

  // Sync when match changes unless user customized
  useEffect(() => {
    if (!isCustomized) {
      setMessageText(defaultFormattedText);
    }
  }, [defaultFormattedText, isCustomized]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    setIsCustomized(true);
  };

  const handleResetToDefault = () => {
    setMessageText(defaultFormattedText);
    setIsCustomized(false);
    onToast('✓ Mensaje restablecido al original');
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prev = messageText;
    const updated = prev.substring(0, start) + snippet + prev.substring(end);
    setMessageText(updated);
    setIsCustomized(true);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Handle Photo File Selection (Camera or Gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('⚠️ Por favor selecciona un archivo de imagen válido');
      return;
    }

    setPhotoFile(file);

    // Read as Base64 Data URL for preview and optional persistence
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoUrl(result);
      if (onSaveMatchPhoto) {
        onSaveMatchPhoto(match.id, result);
      }
      onToast('✓ Foto del partido cargada');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onSaveMatchPhoto) {
      onSaveMatchPhoto(match.id, undefined);
    }
    onToast('✓ Foto eliminada');
  };

  const handleCopyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
      setCopied(true);
      onToast('✓ ¡Texto del partido copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Convert base64 data URL to File if loaded from saved match photo
  const getShareableFile = async (): Promise<File | null> => {
    if (photoFile) return photoFile;
    if (!photoUrl) return null;

    try {
      const res = await fetch(photoUrl);
      const blob = await res.blob();
      const fileName = `partido-${nameA.toLowerCase().replace(/\s+/g, '-')}-vs-${nameB.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
    } catch (e) {
      console.warn('Could not convert photoUrl to File:', e);
      return null;
    }
  };

  const handleShareToWhatsApp = async () => {
    setIsSharing(true);
    try {
      const shareFile = await getShareableFile();

      // Check if Web Share API supports file sharing (standard in iOS 15+ Safari & Android Chrome)
      if (
        shareFile &&
        navigator.canShare &&
        navigator.canShare({ files: [shareFile] })
      ) {
        try {
          await navigator.share({
            title: `${nameA} vs ${nameB}`,
            text: messageText,
            files: [shareFile],
          });
          onToast('✓ ¡Partido y foto compartidos con éxito!');
          setIsSharing(false);
          return;
        } catch (err: any) {
          // User aborted share sheet or cancelled
          if (err.name === 'AbortError') {
            setIsSharing(false);
            return;
          }
        }
      }

      // Fallback: Web Share for text only on mobile
      if (
        navigator.share &&
        /mobile|android|iphone|ipad/i.test(navigator.userAgent)
      ) {
        try {
          await navigator.share({
            title: `${nameA} vs ${nameB}`,
            text: messageText,
          });
          onToast('✓ ¡Resultado enviado!');
          setIsSharing(false);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            setIsSharing(false);
            return;
          }
        }
      }

      // Direct WhatsApp URL scheme (works on both Web & Mobile)
      const encodedText = encodeURIComponent(messageText);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

      // If photo was present, copy text to clipboard as helper
      if (photoUrl && navigator.clipboard) {
        navigator.clipboard.writeText(messageText);
        onToast('✓ Texto copiado al portapapeles. Abriendo WhatsApp...');
      } else {
        onToast('✓ Abriendo WhatsApp...');
      }

      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error sharing:', err);
      onToast('⚠️ Error al compartir');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-5 pb-safe shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5 duration-200">
        {/* iOS Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Compartir Partido
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {match.stageLabel} • {match.court}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2">
          {/* Match Scoreboard Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm">
            <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider mb-2 text-center">
              {config.name} {config.category ? `• ${config.category}` : ''}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center font-black text-xs text-white border border-white/20 shadow-xs"
                  style={{ backgroundColor: teamA?.color || '#3b82f6' }}
                >
                  {nameA.charAt(0)}
                </div>
                <div className="text-xs font-black truncate">{nameA}</div>
              </div>

              <div className="px-3 py-1 bg-white/10 rounded-xl text-center min-w-[70px]">
                {match.isCompleted ? (
                  <>
                    <div className="text-xl font-black tracking-tight text-white">
                      {match.scoreA ?? 0} - {match.scoreB ?? 0}
                    </div>
                    {match.isShootout && (
                      <div className="text-[9px] text-amber-300 font-bold">
                        SO: {match.shootoutScoreA ?? 0}-{match.shootoutScoreB ?? 0}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs font-bold text-slate-300 py-1">VS</div>
                )}
              </div>

              <div className="flex-1 text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center font-black text-xs text-white border border-white/20 shadow-xs"
                  style={{ backgroundColor: teamB?.color || '#ef4444' }}
                >
                  {nameB.charAt(0)}
                </div>
                <div className="text-xs font-black truncate">{nameB}</div>
              </div>
            </div>

            {/* Quick Goals Summary */}
            {match.goals && match.goals.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5 justify-center">
                {match.goals.map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-200"
                  >
                    <Flame className="w-2.5 h-2.5 text-amber-400" />
                    <span>{g.playerName}</span>
                    <span className="font-bold text-white">({g.count})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Photo Section */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Foto del Partido (Opcional)
                </span>
              </div>
              {photoUrl && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Foto adjunta ✓
                </span>
              )}
            </div>

            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 aspect-video flex items-center justify-center group">
                <img
                  src={photoUrl}
                  alt="Foto del partido"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {/* Desktop hover actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white text-slate-800 rounded-full text-xs font-bold flex items-center gap-1 shadow-md hover:bg-slate-100"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 bg-rose-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-md hover:bg-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile action button overlay always visible */}
                <div className="absolute bottom-2 right-2 flex gap-1 sm:hidden">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 bg-black/70 text-white rounded-lg text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl bg-white text-center transition-all flex flex-col items-center justify-center gap-1.5 active:scale-[0.99]"
                >
                  <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Tomar o subir foto del partido
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Foto de equipo, festejo, tablero o planilla final
                  </div>
                </button>
              </div>
            )}

            {/* Hidden File Input supporting camera capture on iOS/Android */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* WhatsApp Text Editor Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Mensaje de WhatsApp (Editable)
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isCustomized && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-colors"
                    title="Restablecer formato original generado"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Restablecer</span>
                  </button>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCustomized
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isCustomized ? 'Personalizado' : 'Automático'}
                </span>
              </div>
            </div>

            {/* Formatting shortcuts bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 px-1 text-[11px]">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Insertar:</span>
              <button
                type="button"
                onClick={() => insertSnippet('🏑 ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                🏑
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('🏆 ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                🏆
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('⭐ ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                ⭐
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('🔥 ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                🔥
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('*texto*')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px]"
                title="Texto en negrita"
              >
                *negrita*
              </button>
            </div>

            {/* WhatsApp Textarea Bubble */}
            <div className="bg-[#EFEAE2] p-2.5 rounded-2xl border border-[#DAD2C7] shadow-inner relative">
              <div className="bg-white p-2.5 rounded-xl shadow-xs border border-[#E9EDEF]">
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleTextChange}
                  rows={8}
                  className="w-full font-mono text-[11px] text-[#111B21] leading-relaxed bg-transparent border-0 focus:outline-hidden focus:ring-0 resize-y"
                  placeholder="Escribe o edita el mensaje para WhatsApp..."
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 px-1 text-right">
              {messageText.length} caracteres • Puedes editar cualquier línea antes de enviar
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all min-h-[48px] active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            id="btn-send-single-match-whatsapp"
            type="button"
            disabled={isSharing}
            onClick={handleShareToWhatsApp}
            className="flex-[1.6] py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px] active:scale-95 disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>{photoUrl ? 'Compartir con Foto' : 'Enviar por WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

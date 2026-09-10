import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Camera,
  Check,
  Copy,
  Edit3,
  Flame,
  MessageCircle,
  RotateCcw,
  Share2,
  Trash2,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import {
  Match,
  PlayerCardStat,
  ScorerStat,
  StandingsRow,
  Team,
  TournamentConfig,
} from '../types';
import {
  formatWhatsAppResults,
  formatWhatsAppScorers,
  formatWhatsAppSingleMatch,
  formatWhatsAppStandings,
  formatWhatsAppSummary,
} from '../utils/tournamentEngine';

export type ShareType = 'summary' | 'standings' | 'results' | 'single_match' | 'scorers';

interface WhatsAppShareModalProps {
  initialType?: ShareType;
  initialRoundFilter?: string;
  initialMatchId?: string;
  config: TournamentConfig;
  standings: StandingsRow[];
  matches: Match[];
  teams: Team[];
  topScorers: ScorerStat[];
  cardStats: PlayerCardStat[];
  onClose: () => void;
  onSaveMatchPhoto?: (matchId: string, photoUrl: string | undefined) => void;
  onToast: (msg: string) => void;
}

export function WhatsAppShareModal({
  initialType = 'standings',
  initialRoundFilter = 'all',
  initialMatchId,
  config,
  standings,
  matches,
  teams,
  topScorers,
  cardStats,
  onClose,
  onSaveMatchPhoto,
  onToast,
}: WhatsAppShareModalProps) {
  const [shareType, setShareType] = useState<ShareType>(initialType);
  const [selectedRound, setSelectedRound] = useState<string>(initialRoundFilter);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId || matches[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  // Selected single match reference
  const selectedMatch = useMemo(() => {
    return matches.find((m) => m.id === selectedMatchId) || matches[0];
  }, [matches, selectedMatchId]);

  const [matchPhotoUrl, setMatchPhotoUrl] = useState<string | undefined>(
    selectedMatch?.photoUrl
  );

  // Sync photo if match changes
  const handleSelectMatch = (mId: string) => {
    setSelectedMatchId(mId);
    const targetMatch = matches.find((m) => m.id === mId);
    setMatchPhotoUrl(targetMatch?.photoUrl);
    setPhotoFile(null);
    setIsCustomized(false);
  };

  // Get unique rounds / stages
  const roundLabels = useMemo(() => {
    return Array.from(new Set(matches.map((m) => m.stageLabel || `Fecha ${m.round}`)));
  }, [matches]);

  // Default Formatted Text generation
  const defaultFormattedText = useMemo(() => {
    switch (shareType) {
      case 'standings':
        return formatWhatsAppStandings(
          config.name,
          standings,
          config.category,
          config.season,
          config.whatsappHeader,
          config.whatsappFooter
        );
      case 'results':
        return formatWhatsAppResults(
          config.name,
          matches,
          teams,
          selectedRound,
          config.category,
          config.season,
          config.whatsappHeader,
          config.whatsappFooter
        );
      case 'single_match':
        if (!selectedMatch) return '';
        return formatWhatsAppSingleMatch(
          selectedMatch,
          teams,
          config.name,
          config.category,
          config.season,
          config.whatsappHeader,
          config.whatsappFooter
        );
      case 'scorers':
        return formatWhatsAppScorers(
          config.name,
          topScorers,
          cardStats,
          config.category,
          config.whatsappHeader,
          config.whatsappFooter
        );
      case 'summary':
      default:
        return formatWhatsAppSummary(
          config.name,
          standings,
          matches,
          teams,
          topScorers,
          config.category,
          config.season,
          config.whatsappHeader,
          config.whatsappFooter
        );
    }
  }, [shareType, selectedRound, selectedMatch, config, standings, matches, teams, topScorers, cardStats]);

  // User editable message text
  const [messageText, setMessageText] = useState<string>(defaultFormattedText);

  // Synchronize text when filters change if user has not customized it
  useEffect(() => {
    if (!isCustomized) {
      setMessageText(defaultFormattedText);
    }
  }, [defaultFormattedText, isCustomized]);

  const handleShareTypeChange = (newType: ShareType) => {
    setShareType(newType);
    setIsCustomized(false);
  };

  const handleRoundChange = (round: string) => {
    setSelectedRound(round);
    setIsCustomized(false);
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('⚠️ Por favor selecciona una imagen');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setMatchPhotoUrl(result);
      if (selectedMatch && onSaveMatchPhoto) {
        onSaveMatchPhoto(selectedMatch.id, result);
      }
      onToast('✓ Foto del partido cargada');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setMatchPhotoUrl(undefined);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selectedMatch && onSaveMatchPhoto) {
      onSaveMatchPhoto(selectedMatch.id, undefined);
    }
    onToast('✓ Foto eliminada');
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
      setCopied(true);
      onToast('✓ ¡Texto copiado para WhatsApp!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShareableFile = async (): Promise<File | null> => {
    if (photoFile) return photoFile;
    if (!matchPhotoUrl) return null;

    try {
      const res = await fetch(matchPhotoUrl);
      const blob = await res.blob();
      return new File([blob], 'partido-hockey.jpg', { type: blob.type || 'image/jpeg' });
    } catch (e) {
      return null;
    }
  };

  const handleSendToWhatsApp = async () => {
    const file = shareType === 'single_match' ? await getShareableFile() : null;

    // Try Web Share API with image file if present
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: config.name,
          text: messageText,
          files: [file],
        });
        onToast('✓ ¡Compartido con foto!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Try standard Web Share API for text on mobile
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: config.name,
          text: messageText,
        });
        onToast('✓ ¡Enviado!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Direct WhatsApp web / app link
    const encodedText = encodeURIComponent(messageText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    if (matchPhotoUrl && navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onToast('✓ Abriendo WhatsApp...');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-3xl p-5 pb-safe shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-5 duration-200">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Compartir en WhatsApp
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {config.name} {config.category ? `• ${config.category}` : ''}
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

        {/* Share Category Selector */}
        <div className="pt-3 pb-2 shrink-0">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            ¿Qué deseas compartir?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <button
              id="btn-share-type-standings"
              onClick={() => handleShareTypeChange('standings')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                shareType === 'standings'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Posiciones</span>
            </button>

            <button
              id="btn-share-type-single-match"
              onClick={() => handleShareTypeChange('single_match')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                shareType === 'single_match'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>1 Partido</span>
            </button>

            <button
              id="btn-share-type-results"
              onClick={() => handleShareTypeChange('results')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                shareType === 'results'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Resultados</span>
            </button>

            <button
              id="btn-share-type-summary"
              onClick={() => handleShareTypeChange('summary')}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                shareType === 'summary'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Resumen</span>
            </button>

            <button
              id="btn-share-type-scorers"
              onClick={() => handleShareTypeChange('scorers')}
              className={`py-2 px-2 col-span-2 sm:col-span-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] ${
                shareType === 'scorers'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span>Goleadores</span>
            </button>
          </div>
        </div>

        {/* Scrollable Configuration & Preview */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-1">
          {/* Results Specific Sub-Filter: Round / Stage selector */}
          {shareType === 'results' && roundLabels.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Filtrar Jornada / Fase:
              </label>
              <select
                value={selectedRound}
                onChange={(e) => handleRoundChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[40px]"
              >
                <option value="all">Todas las fechas y playoffs ({matches.length} partidos)</option>
                {roundLabels.map((lbl) => (
                  <option key={lbl} value={lbl}>
                    {lbl}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Single Match Selector & Photo Tool */}
          {shareType === 'single_match' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Seleccionar Partido:
                </label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => handleSelectMatch(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[42px]"
                >
                  {matches.map((m) => {
                    const tA = teamMap.get(m.teamAId)?.name || m.placeholderA || 'TBD';
                    const tB = teamMap.get(m.teamBId)?.name || m.placeholderB || 'TBD';
                    const score = m.isCompleted ? ` (${m.scoreA}-${m.scoreB})` : ' [Pendiente]';
                    return (
                      <option key={m.id} value={m.id}>
                        {m.stageLabel}: {tA} vs {tB} {score}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Photo Upload Box for this single match */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Foto para acompañar el mensaje
                    </span>
                  </div>
                  {matchPhotoUrl && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Foto adjunta ✓
                    </span>
                  )}
                </div>

                {matchPhotoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black/5 aspect-video flex items-center justify-center group">
                    <img
                      src={matchPhotoUrl}
                      alt="Foto del partido"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Cambiar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-white text-center transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">
                      Adjuntar o tomar foto del partido
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* WhatsApp Message Editor Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Mensaje para WhatsApp (Editable)
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
                onClick={() => insertSnippet('📅 ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                📅
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('📍 ')}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold"
              >
                📍
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

            {/* WhatsApp Textarea Canvas */}
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

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
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
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            id="btn-confirm-send-whatsapp"
            type="button"
            onClick={handleSendToWhatsApp}
            className="flex-[1.5] py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px] active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>
              {shareType === 'single_match' && matchPhotoUrl
                ? 'Enviar con Foto'
                : 'Enviar por WhatsApp'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

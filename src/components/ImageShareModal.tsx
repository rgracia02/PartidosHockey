import { useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Match, StandingsRow, Team, TournamentFormat } from '../types';
import { getSortedRoundLabels } from '../utils/tournamentEngine';
import { captureElementAsPngFile, shareOrDownloadImageFile } from '../utils/imageExport';
import { ExportableStandingsImage } from './ExportableStandingsImage';
import { ExportableFixtureImage } from './ExportableFixtureImage';

export type ImageShareType = 'standings' | 'fixture';

interface ImageShareModalProps {
  type: ImageShareType;
  tournamentName: string;
  category?: string;
  format: TournamentFormat;
  standings?: StandingsRow[];
  matches?: Match[];
  teams?: Team[];
  onClose: () => void;
  onToast: (msg: string) => void;
}

export function ImageShareModal({
  type,
  tournamentName,
  category,
  format,
  standings = [],
  matches = [],
  teams = [],
  onClose,
  onToast,
}: ImageShareModalProps) {
  const [roundFilter, setRoundFilter] = useState('all');
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const roundLabels = getSortedRoundLabels(matches);

  const handleShare = async () => {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const fileName = `${type === 'standings' ? 'posiciones' : 'fixture'}-${tournamentName.replace(/\s+/g, '-').toLowerCase()}.png`;
      const file = await captureElementAsPngFile(cardRef.current, fileName);
      const result = await shareOrDownloadImageFile(file, tournamentName);
      if (result === 'downloaded') {
        onToast('✓ Imagen descargada');
      } else if (result === 'shared') {
        onToast('✓ Imagen compartida');
      }
    } catch (err) {
      console.error('Error exporting image:', err);
      onToast('No se pudo generar la imagen');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Imagen para compartir</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {type === 'standings' ? 'Tabla de Posiciones' : 'Fixture'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {type === 'fixture' && roundLabels.length > 0 && (
          <div className="pt-3">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Fechas a incluir en la imagen:
            </label>
            <select
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white min-h-[44px]"
            >
              <option value="all">Todas las fechas</option>
              {roundLabels.map((lbl) => (
                <option key={lbl} value={lbl}>
                  Solo {lbl}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live preview of the exact image that will be shared */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 flex justify-center bg-slate-100 dark:bg-slate-950 rounded-2xl mt-3">
          <div className="py-4">
            {type === 'standings' ? (
              <ExportableStandingsImage
                ref={cardRef}
                tournamentName={tournamentName}
                category={category}
                standings={standings}
                format={format}
              />
            ) : (
              <ExportableFixtureImage
                ref={cardRef}
                tournamentName={tournamentName}
                category={category}
                matches={matches}
                teams={teams}
                roundFilter={roundFilter}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="mt-4 w-full py-3.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-60 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all min-h-[48px]"
        >
          {isSharing ? (
            <span>Generando imagen...</span>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Compartir Imagen</span>
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1">
          <Download className="w-3 h-3" />
          <span>Si no se abre el panel para compartir, la imagen se descarga sola.</span>
        </p>
      </div>
    </div>
  );
}

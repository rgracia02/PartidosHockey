/**
 * Converts an in-memory SVG element into a PNG File, entirely client-side and
 * without any external rendering library. We build our shareable images as
 * plain SVG (explicit shapes/text, not arbitrary CSS) specifically so this
 * conversion never depends on parsing the app's Tailwind stylesheet — that
 * was the actual cause of "no se pudo generar la imagen" with html2canvas,
 * which chokes on the modern oklch()/color-mix() colors Tailwind v4 uses.
 */
export async function svgToPngFile(
  svg: SVGSVGElement,
  fileName: string,
  scale: number = 2
): Promise<File> {
  const width = svg.viewBox.baseVal.width || svg.width.baseVal.value || 340;
  const height = svg.viewBox.baseVal.height || svg.height.baseVal.value || 200;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('No se pudo procesar el gráfico generado.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo preparar el lienzo de la imagen.');

    // White background so the PNG isn't transparent when shared/saved.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject(new Error('No se pudo generar la imagen.'));
          return;
        }
        resolve(b);
      }, 'image/png');
    });

    return new File([blob], fileName, { type: 'image/png' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ShareImageResult = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownloadImageFile(file: File, title: string): Promise<ShareImageResult> {
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return 'shared';
    } catch (err) {
      // AbortError happens when the user just closes the native share sheet — not a real error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled';
      }
      throw err;
    }
  }

  // Fallback for browsers without file-sharing support: trigger a plain download.
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

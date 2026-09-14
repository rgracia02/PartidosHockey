export async function captureElementAsPngFile(element: HTMLElement, fileName: string): Promise<File> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  });

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

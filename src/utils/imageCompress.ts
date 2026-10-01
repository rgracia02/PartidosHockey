/**
 * Reduce una foto elegida desde la cámara o la galería antes de guardarla.
 *
 * Las fotos del celular suelen pesar entre 3 y 8 MB. Guardadas como base64 dentro de
 * localStorage (cupo de ~5 MB) o de un documento de Firestore (límite de 1 MiB) hacían que
 * el guardado fallara sin avisar. Acá se achican a un lado máximo de 1280 px y se
 * recodifican como JPEG, con un tope de peso aproximado.
 */

// Tope aproximado en caracteres del data URL (~330 KB de imagen real).
const MAX_DATA_URL_LENGTH = 450_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

async function loadSource(file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    try {
      // 'from-image' respeta la rotación EXIF (fotos verticales sacadas con el celular).
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Cae al método clásico más abajo.
    }
  }
  const img = await loadImage(file);
  return { source: img, width: img.naturalWidth, height: img.naturalHeight };
}

export async function compressImageFile(file: File, maxSide = 1280, quality = 0.72): Promise<string> {
  const { source, width, height } = await loadSource(file);
  if (!width || !height) throw new Error('Imagen vacía');

  let side = maxSide;
  let q = quality;

  for (let attempt = 0; attempt < 4; attempt++) {
    const scale = Math.min(1, side / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');

    // Fondo blanco: los PNG con transparencia se verían negros al pasar a JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', q);
    if (dataUrl.length <= MAX_DATA_URL_LENGTH || attempt === 3) {
      if ('close' in source && typeof (source as ImageBitmap).close === 'function') {
        (source as ImageBitmap).close();
      }
      return dataUrl;
    }
    // Todavía pesa de más: probar más chica y con un poco más de compresión.
    side = Math.round(side * 0.8);
    q = Math.max(0.5, q - 0.08);
  }

  throw new Error('No se pudo comprimir la imagen');
}

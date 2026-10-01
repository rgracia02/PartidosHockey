import { RefObject, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad básica para un diálogo modal (hoja inferior o ventana centrada):
 *  - el foco entra al diálogo al abrirse y vuelve a donde estaba al cerrarse,
 *  - Escape lo cierra,
 *  - Tab y Shift+Tab no se escapan hacia el contenido de atrás,
 *  - la página de fondo no hace scroll mientras está abierto.
 *
 * El contenedor del diálogo tiene que llevar `tabIndex={-1}`, `role="dialog"`,
 * `aria-modal="true"` y `aria-labelledby` apuntando a su título.
 */
export function useDialogA11y(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    node?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

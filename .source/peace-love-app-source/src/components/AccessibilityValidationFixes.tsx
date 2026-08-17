import { useEffect } from 'react';

export default function AccessibilityValidationFixes() {
  useEffect(() => {
    let frame = 0;

    const applyValidatedState = () => {
      const faqButtons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('#neighbor-standard-trust button')
      ).filter((button) => {
        const panel = button.nextElementSibling as HTMLElement | null;
        return Boolean(panel && panel.style.maxHeight !== '');
      });

      faqButtons.forEach((button, index) => {
        const panel = button.nextElementSibling as HTMLElement | null;
        if (!panel) return;

        if (!button.id) button.id = `faq-trigger-${index}`;
        if (!panel.id) panel.id = `faq-panel-${index}`;

        const expanded = panel.style.maxHeight !== '0px';
        button.setAttribute('aria-expanded', String(expanded));
        button.setAttribute('aria-controls', panel.id);
        panel.setAttribute('aria-labelledby', button.id);
      });

      const dialog = document.querySelector<HTMLElement>('#typeform-modal-overlay > div');
      if (!dialog || dialog.dataset.validatedInitialFocus === 'true') return;

      const firstField = dialog.querySelector<HTMLElement>('input, textarea, select');
      if (!firstField) return;

      dialog.dataset.validatedInitialFocus = 'true';
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => firstField.focus());
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyValidatedState();
      });
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', schedule, true);
    applyValidatedState();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', schedule, true);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

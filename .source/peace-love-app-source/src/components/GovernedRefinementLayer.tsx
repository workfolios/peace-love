import { useEffect, useRef } from 'react';
import { ActivePage } from '../types';

interface GovernedRefinementLayerProps {
  activePage: ActivePage;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

const SENSITIVE_ACCESS_PATTERN = /(?:garage|door|gate|alarm|lockbox|keypad|access|entry)\s*(?:door\s*)?(?:code|pin|password)|\b(?:lockbox|keypad)\b|\bkey(?:s)?\s+(?:under|inside|hidden|located|is|are)\b/i;

function setAttributeIfChanged(element: Element | null, name: string, value: string | null) {
  if (!element) return;
  if (value === null) {
    if (element.hasAttribute(name)) element.removeAttribute(name);
    return;
  }
  if (element.getAttribute(name) !== value) element.setAttribute(name, value);
}

function isElementVisible(element: HTMLElement) {
  return element.getClientRects().length > 0 && window.getComputedStyle(element).visibility !== 'hidden';
}

export default function GovernedRefinementLayer({ activePage }: GovernedRefinementLayerProps) {
  const lastModalTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const originalScrollTo = window.scrollTo.bind(window);
    const originalScrollBy = window.scrollBy.bind(window);
    let reducedMotionApplied = false;

    const reducedScrollTo = ((arg1?: ScrollToOptions | number, arg2?: number) => {
      if (typeof arg1 === 'object') {
        originalScrollTo({ ...arg1, behavior: 'auto' });
      } else if (typeof arg1 === 'number') {
        originalScrollTo(arg1, typeof arg2 === 'number' ? arg2 : 0);
      } else {
        originalScrollTo(0, 0);
      }
    }) as typeof window.scrollTo;

    const reducedScrollBy = ((arg1?: ScrollToOptions | number, arg2?: number) => {
      if (typeof arg1 === 'object') {
        originalScrollBy({ ...arg1, behavior: 'auto' });
      } else if (typeof arg1 === 'number') {
        originalScrollBy(arg1, typeof arg2 === 'number' ? arg2 : 0);
      } else {
        originalScrollBy(0, 0);
      }
    }) as typeof window.scrollBy;

    const applyMotionPreference = () => {
      if (mediaQuery.matches && !reducedMotionApplied) {
        window.scrollTo = reducedScrollTo;
        window.scrollBy = reducedScrollBy;
        reducedMotionApplied = true;
      } else if (!mediaQuery.matches && reducedMotionApplied) {
        window.scrollTo = originalScrollTo as typeof window.scrollTo;
        window.scrollBy = originalScrollBy as typeof window.scrollBy;
        reducedMotionApplied = false;
      }
    };

    applyMotionPreference();
    mediaQuery.addEventListener('change', applyMotionPreference);

    return () => {
      mediaQuery.removeEventListener('change', applyMotionPreference);
      if (reducedMotionApplied) {
        window.scrollTo = originalScrollTo as typeof window.scrollTo;
        window.scrollBy = originalScrollBy as typeof window.scrollBy;
      }
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let modalWasOpen = false;
    let previousBodyOverflow = '';

    const enhanceDocument = () => {
      // RO-064 / F-01: keep the public inquiry operational while preventing disclosure of physical-access credentials.
      const homeInstructions = document.getElementById('input-home-instructions') as HTMLTextAreaElement | null;
      if (homeInstructions) {
        homeInstructions.placeholder = 'Mail, plants, package handling, routines, or other non-sensitive home details. Do not enter keys, access codes, or credentials.';
      }
      const additionalNotes = document.getElementById('input-notes') as HTMLTextAreaElement | null;
      if (additionalNotes) {
        additionalNotes.placeholder = 'Share any other non-sensitive planning notes. Do not enter garage, lockbox, keypad, alarm, or access codes.';
      }

      const requestForm = document.getElementById('booking-intake-form');
      if (requestForm && !document.getElementById('sensitive-info-guidance')) {
        const guidance = document.createElement('div');
        guidance.id = 'sensitive-info-guidance';
        guidance.setAttribute('role', 'note');
        guidance.className = 'rounded-xl border border-brand-pink/20 bg-brand-pink-light/30 px-4 py-3 text-xs font-semibold leading-relaxed text-brand-plum';
        guidance.textContent = 'For your security, do not enter door, garage, gate, alarm, lockbox, keypad, key-location, password, PIN, or other access credentials in this public inquiry. Share sensitive access instructions only after service details are confirmed through direct coordination.';
        requestForm.prepend(guidance);
      }

      // RO-085 / F-05: expose current, expanded, and selected state programmatically without changing approved presentation copy.
      document.querySelectorAll('[id^="nav-item-"], [id^="mobile-nav-"]').forEach((element) => {
        setAttributeIfChanged(element, 'aria-current', null);
      });
      setAttributeIfChanged(document.getElementById(`nav-item-${activePage}`), 'aria-current', 'page');
      setAttributeIfChanged(document.getElementById(`mobile-nav-${activePage}`), 'aria-current', 'page');

      const faqButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('#neighbor-standard-trust button'))
        .filter((button) => button.textContent?.trim().endsWith('?'));
      faqButtons.forEach((button, index) => {
        const panel = button.nextElementSibling as HTMLElement | null;
        if (!panel) return;
        if (!button.id) button.id = `faq-trigger-${index}`;
        if (!panel.id) panel.id = `faq-panel-${index}`;
        const expanded = panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';
        setAttributeIfChanged(button, 'aria-expanded', String(expanded));
        setAttributeIfChanged(button, 'aria-controls', panel.id);
        setAttributeIfChanged(panel, 'aria-labelledby', button.id);
      });

      document.querySelectorAll<HTMLButtonElement>('[id^="btn-pathOption-"]').forEach((button) => {
        const selected = button.className.includes('bg-brand-pink-light/30');
        setAttributeIfChanged(button, 'aria-pressed', String(selected));
      });

      document.querySelectorAll<HTMLButtonElement>('[id^="dot-indicator-"]').forEach((button) => {
        const current = button.className.includes('w-7');
        setAttributeIfChanged(button, 'aria-current', current ? 'true' : null);
      });

      // RO-083 / F-04: complete the testimonial dialog keyboard lifecycle without altering visual design or feature language.
      const overlay = document.getElementById('typeform-modal-overlay');
      const dialog = overlay?.firstElementChild as HTMLElement | null;
      if (dialog) {
        if (!modalWasOpen) previousBodyOverflow = document.body.style.overflow;
        modalWasOpen = true;
        document.body.style.overflow = 'hidden';
        setAttributeIfChanged(dialog, 'role', 'dialog');
        setAttributeIfChanged(dialog, 'aria-modal', 'true');
        setAttributeIfChanged(dialog, 'aria-label', 'Share a neighborhood note');

        const closeButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'))
          .find((button) => !button.textContent?.trim());
        if (closeButton) setAttributeIfChanged(closeButton, 'aria-label', 'Close neighborhood note form');

        if (!dialog.dataset.refinementFocusInitialized) {
          dialog.dataset.refinementFocusInitialized = 'true';
          const initialTarget = dialog.querySelector<HTMLElement>('input, textarea, select') || closeButton || dialog;
          if (!initialTarget.hasAttribute('tabindex') && initialTarget === dialog) initialTarget.setAttribute('tabindex', '-1');
          window.requestAnimationFrame(() => initialTarget.focus());
        }
      } else if (modalWasOpen) {
        modalWasOpen = false;
        document.body.style.overflow = previousBodyOverflow;
        window.requestAnimationFrame(() => lastModalTriggerRef.current?.focus());
      }
    };

    const scheduleEnhancement = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        enhanceDocument();
      });
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const trigger = target?.closest<HTMLElement>('#share-testimonial-btn');
      if (trigger) lastModalTriggerRef.current = trigger;
      scheduleEnhancement();
    };

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      const overlay = document.getElementById('typeform-modal-overlay');
      const dialog = overlay?.firstElementChild as HTMLElement | null;
      if (!dialog) return;

      if (event.key === 'Escape') {
        const closeButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'))
          .find((button) => !button.textContent?.trim() || button.getAttribute('aria-label') === 'Close neighborhood note form');
        if (closeButton) {
          event.preventDefault();
          closeButton.click();
        }
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isElementVisible);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleSensitiveSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.id !== 'booking-intake-form') return;

      const fields = [
        document.getElementById('input-home-instructions') as HTMLTextAreaElement | null,
        document.getElementById('input-notes') as HTMLTextAreaElement | null
      ].filter((field): field is HTMLTextAreaElement => Boolean(field));

      const offendingField = fields.find((field) => SENSITIVE_ACCESS_PATTERN.test(field.value));
      const existingError = document.getElementById('sensitive-info-error');
      fields.forEach((field) => field.removeAttribute('aria-invalid'));

      if (!offendingField) {
        existingError?.remove();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      offendingField.setAttribute('aria-invalid', 'true');

      const error = existingError || document.createElement('div');
      error.id = 'sensitive-info-error';
      error.setAttribute('role', 'alert');
      error.className = 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-relaxed text-red-800';
      error.textContent = 'For your security, remove access credentials or key-location details before submitting this public inquiry. Jamie can coordinate sensitive access information directly after service details are confirmed.';
      if (!existingError) form.prepend(error);
      offendingField.setAttribute('aria-describedby', 'sensitive-info-error');
      offendingField.focus();
    };

    const observer = new MutationObserver(scheduleEnhancement);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', handleDocumentClick, true);
    document.addEventListener('change', scheduleEnhancement, true);
    document.addEventListener('scroll', scheduleEnhancement, true);
    document.addEventListener('keydown', handleDocumentKeyDown, true);
    document.addEventListener('submit', handleSensitiveSubmit, true);

    enhanceDocument();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('change', scheduleEnhancement, true);
      document.removeEventListener('scroll', scheduleEnhancement, true);
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
      document.removeEventListener('submit', handleSensitiveSubmit, true);
      if (frame) window.cancelAnimationFrame(frame);
      if (modalWasOpen) document.body.style.overflow = previousBodyOverflow;
    };
  }, [activePage]);

  return null;
}

/**
 * Utilitários de acessibilidade para gerenciar foco e navegação por teclado
 */

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

export const manageAriaLive = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  const existingRegion = document.querySelector(`[aria-live="${politeness}"]`);
  
  if (existingRegion) {
    existingRegion.textContent = message;
  } else {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.left = '-9999px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    region.textContent = message;
    document.body.appendChild(region);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(region);
    }, 1000);
  }
};

export const announceToScreenReader = (message: string) => {
  manageAriaLive(message, 'assertive');
};

export const announcePolite = (message: string) => {
  manageAriaLive(message, 'polite');
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];
};

export const focusFirstElement = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
};

export const focusNextElement = (container: HTMLElement, currentElement: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  const nextIndex = (currentIndex + 1) % focusableElements.length;
  focusableElements[nextIndex].focus();
};

export const focusPreviousElement = (container: HTMLElement, currentElement: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  const previousIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
  focusableElements[previousIndex].focus();
};
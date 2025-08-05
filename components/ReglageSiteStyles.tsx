// components/ReglageSiteStyles.tsx
'use client';

import { useReglageSite } from '@/hooks/useReglageSite';

export function ReglageSiteStyles() {
  const context = useReglageSite();
  
  // Handle case where context might be null or loading
  if (!context || !context.reglage) {
    return null;
  }

  const { reglage } = context;
  const {
    texte_color,
    button_background_color,
    button_text_color,
    button_border_radius,
  } = reglage;

  return (
    <style jsx global>{`
      :root {
        --texte-color: ${texte_color || '#000000'};
        --button-background-color: ${button_background_color || '#01C9E7'};
        --button-text-color: ${button_text_color || '#FFFFFF'};
        --button-border-radius: ${button_border_radius ? `${button_border_radius}px` : '4px'};
      }
    `}</style>
  );
}

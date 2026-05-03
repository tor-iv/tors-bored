'use client';

import { useEffect } from 'react';

export default function DesignPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hide the root layout's Header and Footer for design previews
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <div className="design-preview-container">
      {children}
    </div>
  );
}

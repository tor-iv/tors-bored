'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const variants = [
  { href: '/design-preview/illustrated', label: 'Illustrated' },
  { href: '/design-preview/retro', label: 'Retro' },
  { href: '/design-preview/refined', label: 'Refined' },
  { href: '/design-preview/hybrid', label: 'Hybrid' },
  { href: '/design-preview/happy-medium', label: 'Happy Medium' },
  { href: '/design-preview/foe-finder', label: 'FoeFinder' },
];

export default function PreviewNav() {
  const pathname = usePathname();

  return (
    <nav className="preview-nav-pill">
      {variants.map((variant) => (
        <Link
          key={variant.href}
          href={variant.href}
          className={pathname === variant.href ? 'active' : ''}
        >
          {variant.label}
        </Link>
      ))}
      <span className="opacity-30">|</span>
      <Link href="/" className="text-yellow-400 hover:text-yellow-300">
        Exit
      </Link>
    </nav>
  );
}

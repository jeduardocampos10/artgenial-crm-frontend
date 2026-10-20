import type { CSSProperties } from 'react';

interface AppLogoProps {
  className?: string;
  alt?: string;
  style?: CSSProperties;
  forceTheme?: 'dark' | 'light';
  variant?: 'login' | 'sidebar' | 'icon';
}

export function AppLogo({ className, alt = 'ArtGenial CRM', style, forceTheme, variant = 'login' }: AppLogoProps) {
  const assets = {
    login: ['login-logo.png', 'login-logo@2x.png'],
    sidebar: ['sidebar-logo-h32.png', 'sidebar-logo-h32@2x.png'],
    icon: ['sidebar-icone-32.png', 'sidebar-icone@2x-64.png'],
  };
  const [src, retina] = assets[variant];
  return (
    <img
      src={`/ArtGenial/CRM/${src}`}
      srcSet={`/ArtGenial/CRM/${src} 1x, /ArtGenial/CRM/${retina} 2x`}
      alt={alt}
      className={`artgenial-logo ${className ?? ''}`}
      style={{ objectFit: 'contain', ...(forceTheme === 'dark' ? { background: '#ffffff', borderRadius: 4 } : {}), ...style }}
    />
  );
}

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
    login: {
      light: '/ArtGenial/01_Logos_Horizontais/artgenial-logo-principal-fundo-claro.png',
      dark: '/ArtGenial/01_Logos_Horizontais/artgenial-logo-fundo-escuro-transparente.png',
    },
    sidebar: {
      light: '/ArtGenial/01_Logos_Horizontais/artgenial-logo-reduzida-fundo-claro.png',
      dark: '/ArtGenial/01_Logos_Horizontais/artgenial-logo-reduzida-fundo-escuro.png',
    },
    icon: {
      light: '/ArtGenial/02_Icones/artgenial-icone-principal-1024.png',
      dark: '/ArtGenial/02_Icones/artgenial-icone-principal-1024.png',
    },
  };
  const imageProps = {
    alt,
    style: { objectFit: 'contain' as const, ...style },
  };
  const logoClass = `artgenial-logo ${className ?? ''}`;

  if (forceTheme) {
    return <img src={assets[variant][forceTheme]} className={logoClass} {...imageProps} />;
  }

  return (
    <>
      <img src={assets[variant].light} className={`${logoClass} dark:hidden`} {...imageProps} />
      <img src={assets[variant].dark} className={`${logoClass} hidden dark:block`} {...imageProps} />
    </>
  );
}

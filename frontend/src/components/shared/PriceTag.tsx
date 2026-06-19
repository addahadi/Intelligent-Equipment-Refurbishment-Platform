import React from 'react';

interface PriceTagProps {
  prix: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses: Record<NonNullable<PriceTagProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl font-semibold',
};

const PriceTag: React.FC<PriceTagProps> = ({ prix, size = 'md', className = '' }) => {
  const formatted = `${prix.toLocaleString('fr-FR')} €`;

  return (
    <span
      className={`font-mono ${sizeClasses[size]} ${className}`}
      style={{ color: '#18211F', fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {formatted}
    </span>
  );
};

export default PriceTag;

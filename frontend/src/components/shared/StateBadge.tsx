import React from 'react';
import type { EtatComposant, StatutOffre } from '../../types';

interface StateBadgeProps {
  state: EtatComposant | StatutOffre;
  size?: 'sm' | 'md';
}

interface BadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  inlineStyle?: React.CSSProperties;
}

const badgeConfigs: Record<EtatComposant | StatutOffre, BadgeConfig> = {
  EN_RECONDITIONNEMENT: {
    label: 'En reconditionnement',
    bgColor: 'bg-[#F4EDDD]',
    textColor: 'text-[#A87C2A]',
  },
  EN_VENTE: {
    label: 'En vente',
    bgColor: 'bg-[#E7F2EE]',
    textColor: 'text-[#1C7A62]',
  },
  VENDU: {
    label: 'Vendu',
    bgColor: '',
    textColor: 'text-[#6E7A80]',
    inlineStyle: { backgroundColor: '#F0F2F3' },
  },
  RECYCLE: {
    label: 'Recyclé',
    bgColor: 'bg-[#F2E4DD]',
    textColor: 'text-[#9C4A2C]',
  },
  EN_ATTENTE: {
    label: 'En attente',
    bgColor: 'bg-[#F4EDDD]',
    textColor: 'text-[#A87C2A]',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    bgColor: 'bg-[#E7F2EE]',
    textColor: 'text-[#1C7A62]',
  },
  REJETEE: {
    label: 'Rejetée',
    bgColor: '',
    textColor: 'text-[#6E7A80]',
    inlineStyle: { backgroundColor: '#F0F2F3' },
  },
};

const StateBadge: React.FC<StateBadgeProps> = ({ state, size = 'md' }) => {
  const config = badgeConfigs[state];

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={[
        'inline-flex items-center font-body font-medium',
        'rounded-sm uppercase tracking-wide whitespace-nowrap',
        sizeClasses,
        config.bgColor,
        config.textColor,
      ]
        .filter(Boolean)
        .join(' ')}
      style={config.inlineStyle}
    >
      <span aria-hidden="true" className="leading-none">&#9679;</span>
      {config.label}
    </span>
  );
};

export default StateBadge;

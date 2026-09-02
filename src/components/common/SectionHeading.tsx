import React from 'react';
import { useInView } from '../../hooks/useInView';
import './SectionHeading.css';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  align = 'center',
  light = false,
}) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`section-heading section-heading-${align} ${light ? 'section-heading-light' : ''} ${isInView ? 'animate-fade-in-up' : 'pre-animate'}`}
    >
      <div className="section-heading-accent" />
      <h2 className="section-heading-title">{title}</h2>
      {subtitle && <p className="section-heading-subtitle">{subtitle}</p>}
    </div>
  );
};

import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: 'section' | 'article' | 'div';
}

export default function Card({
  children,
  className = '',
  as: Tag = 'section',
  ...rest
}: CardProps) {
  return (
    <Tag className={`ui-card ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

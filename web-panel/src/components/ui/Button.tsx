import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from '../Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  iconRight?: string;
  children?: ReactNode;
}

export function buttonClass(variant: ButtonVariant = 'primary'): string {
  return `ui-btn ui-btn--${variant}`;
}

export default function Button({
  variant = 'primary',
  icon,
  iconRight,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={`${buttonClass(variant)} ${className}`.trim()} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={15} /> : null}
    </button>
  );
}

import { Component } from 'solid-js';
import './button.css';

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button: Component<ButtonProps> = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
}) => {
  return (
    <button 
      type="button"
      style={{ "background-color": backgroundColor }}
      onClick={onClick}
      class={[
        'storybook-button',
        `storybook-button--${size}`, 
        primary ? 'storybook-button--primary' : 'storybook-button--secondary'
      ].join(' ')}>
        {label}
    </button>
  );
};

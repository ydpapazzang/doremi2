import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type PrimaryButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <button className="primary-button" {...props}>
      {children}
    </button>
  );
}

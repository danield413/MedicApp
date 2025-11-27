import { FC } from "react"

interface PlusIconProps {
  size?: number;
  width?: number;
  height?: number;
}

export const PlusIcon: FC<PlusIconProps> = ({ size = 20, width, height }) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size || height}
      role="presentation"
      viewBox="0 0 24 24"
      width={size || width}
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
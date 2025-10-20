import { FC } from "react"

interface IconProps {
  className?: string;
}

export const BriefcaseIcon: FC<IconProps> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25V14.15M15.75 18.75v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m3-15V5.625c0 .621-.504 1.125-1.125 1.125h-1.5c-.621 0-1.125-.504-1.125-1.125V3.75m7.5 0v1.875c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 0 1-1.125-1.125V3.75m-7.5 0h7.5c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-7.5c-.621 0-1.125-.504-1.125-1.125v-1.5C4.5 4.254 5.004 3.75 5.625 3.75h7.5Z" />
    </svg>
  )
}
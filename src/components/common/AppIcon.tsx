import React from 'react'
import appIconSrc from '../../assets/app-icon.png'

interface AppIconProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  alt?: string
}

export function AppIcon({ alt = 'Tare', className = '', ...props }: AppIconProps): React.ReactElement {
  return (
    <img
      src={appIconSrc}
      alt={alt}
      className={`object-contain ${className}`}
      draggable={false}
      {...props}
    />
  )
}

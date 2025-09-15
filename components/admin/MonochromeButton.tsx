"use client"

import React from "react"
import { Button, ButtonProps } from "@mui/material"
import { BUTTON_STYLES } from "@/lib/constants/admin-constants"
import { TYPOGRAPHY_STYLES } from "@/lib/design/fonts"

type Variant = 'primary' | 'outlined'

interface MonoProps extends Omit<ButtonProps, 'variant'> {
  monoVariant?: Variant
}

export default function MonochromeButton({ monoVariant = 'primary', sx, ...props }: MonoProps) {
  const style = monoVariant === 'outlined' ? BUTTON_STYLES.outlined : BUTTON_STYLES.primary
  return (
    <Button
      variant={monoVariant === 'outlined' ? 'outlined' : 'contained'}
      sx={{ ...style, ...TYPOGRAPHY_STYLES.buttonText, ...sx }}
      {...props}
    />
  )
}



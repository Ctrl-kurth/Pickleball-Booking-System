"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export const ImageWithFallback = ({
  src,
  fallbackSrc = 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?q=80&w=1000', // Default pickleball fallback
  alt,
  className,
  ...props
}: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
};

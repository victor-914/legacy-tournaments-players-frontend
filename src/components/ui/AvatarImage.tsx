"use client";

import Image from "next/image";

interface AvatarImageProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

export function AvatarImage({ src, alt, size, className }: AvatarImageProps) {
  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
    />
  );
}

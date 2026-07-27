import { useState, ImgHTMLAttributes } from 'react';

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export default function BlurImage({ className = '', src, alt, ...props }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`${className} transition-[filter] duration-700 ease-in-out ${
        isLoaded ? 'blur-0' : 'blur-xl'
      }`}
      {...props}
    />
  );
}

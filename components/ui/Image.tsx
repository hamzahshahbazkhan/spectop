import React from 'react';

type ImageProps = {
    src: string;
    alt?: string;
    className: string;
};

export function Img({ src, alt, className }: ImageProps) {
    return (
        <div className='p-2'>
            <img src={src} alt={alt} className={`${className} max-h-48 max-w-48  border-2  border-primary rounded-none focus:outline-none focus:ring-0 focus-visible:border-primary focus-within:border-primary focus:border-primary`} />
        </div>
    );
}
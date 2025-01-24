import React from 'react';

type InputProps = {
    label?: string;
    className?: string;
    value?: string;
    type?: string;
    onInput: (event: React.FormEvent<HTMLInputElement>) => void;
    readOnly?: string;
    placeholder?: string;
};

export function Input({ type, value, className = '', onInput, placeholder }: InputProps) {
    return (
        <div className=''>
            <input type={type} onInput={onInput} value={value} className={`${className} py-2 px-4 w-full bg-text border-2 border-primary rounded-none focus:outline-none focus:ring-0 focus-visible:border-primary focus-within:border-primary focus:border-primary ` } placeholder={placeholder} />
        </div>
    );
}

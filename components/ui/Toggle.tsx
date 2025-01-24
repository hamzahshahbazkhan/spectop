'use client'
import React, { useState } from 'react';

interface ToggleProps {
    label: string;
    value: string;
}

function Toggle({ label, value }: ToggleProps) {
    const [active, setActive] = useState(false);

    const toggleState = () => {
        setActive(!active);
    };

    return (
        <div className='bg-text border-primary border-2 border-b-4 p-2 m-2 '>
            <div className='flex flex-row justify-between'>
            <strong> {label}:</strong>
            <div>
                <button onClick={toggleState} className='mr-4 text-sm'>{active?'[hide]':'[show]'} </button>
            </div>
            </div>
            
            <div className={active ? '' : 'hidden'}>
                {value}
            </div>
        </div>
    );
}

export default Toggle;

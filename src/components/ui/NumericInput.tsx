// src/components/ui/NumericInput.tsx
import React from 'react';

interface NumericInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({ value, onChange, min, max, step, disabled }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = parseFloat(e.target.value);
        if (!isNaN(numValue)) {
            onChange(numValue);
        }
    };

    return (
        <input
            type="number"
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            style={{
                width: '60px',
                padding: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                textAlign: 'center',
            }}
        />
    );
};
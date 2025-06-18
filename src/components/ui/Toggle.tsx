// src/components/ui/Toggle.tsx
import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => {
    return (
        <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '22px' }}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: checked ? '#2196F3' : '#ccc', transition: '.4s', borderRadius: '34px'
            }}></span>
            <span style={{
                position: 'absolute', content: '""', height: '16px', width: '16px', left: '3px', bottom: '3px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                transform: checked ? 'translateX(16px)' : 'translateX(0)'
            }}></span>
        </label>
    );
};
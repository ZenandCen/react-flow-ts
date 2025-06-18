import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNumberNodeData {
    value: number;
    isRunning?: boolean;
    onChange?: (updatedValues: { value?: number }) => void;
}

const CustomNumberNode: React.FC<NodeProps<CustomNumberNodeData>> = ({ id, data }) => {
    const isRunning = data?.isRunning;
    const [inputValue, setInputValue] = useState<number>(data.value || 0);

    useEffect(() => {
        if (data.value) {
            setInputValue(data.value ?? 0);
        }
    }, [data.value]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let finalValue: number;
        const newValue = e.target.value;
        const numericValue = Number(newValue);

        if (!isNaN(numericValue)) {
            finalValue = numericValue;
        } else {
            finalValue = 0;
        }

        setInputValue(finalValue);

        if (data.onChange) {
            data.onChange({value: finalValue });
        }
    }, [data.onChange]);

    const highlightedNodeStyle = useCallback((id: string) => ({
        border: isRunning ? '2px solid red' : '1px solid #ccc',
        borderColor: isRunning ? 'red' : '#777',
        borderRadius: 10,
        padding: 10,
    }), [isRunning]);

    return (
        <div style={highlightedNodeStyle(id)}>
            <strong>🔢 Number Input</strong>
            <input
                value={inputValue === null ? 0 : inputValue}
                placeholder='0'
                onChange={handleChange}
                style={{
                    width: 'calc(100% - 10px)',
                    marginTop: 8,
                    padding: 5,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                }}
                type='number'
                className="nodrag"
            />
            <Handle type="target" position={Position.Left} style={{ border: '1px solid #333',background: '#00bcd4', width: 10, height: 10, borderRadius: '50%' }} />
            <Handle type="source" position={Position.Right} style={{ border: '1px solid #333',background: '#28a745', width: 10, height: 10, borderRadius: '50%' }} />
        </div>
    );
};

export default CustomNumberNode;


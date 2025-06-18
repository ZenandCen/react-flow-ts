import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

// --- Constants ---
const ADD = 'add';
const SUBTRACT = 'subtract';
const MULTIPLY= 'multiply';

// Định nghĩa các phép tính
type Operation = 'add' | 'subtract' | 'multiply';

// Định nghĩa giao diện cho dữ liệu của node Calculator
interface CalculatorNodeData {
    valueA: number;
    valueB: number;
    operation: Operation;
    isRunning?: boolean;
    onChange?: (updatedValues: { valueA?: number; valueB?: number; operation?: Operation }) => void;
}

const CalculatorNode: React.FC<NodeProps<CalculatorNodeData>> = ({ id, data }) => {
    const [a, setA] = useState(data.valueA ?? 0);
    const [b, setB] = useState(data.valueB ?? 0);
    const [operation, setOperation] = useState<Operation>(data.operation ?? 'add');

    const isRunning = data.isRunning;

    useEffect(() => {
        if (typeof data.valueA === 'number' && data.valueA !== a) {
            setA(data.valueA);
        }
        if (typeof data.valueB === 'number' && data.valueB !== b) {
            setB(data.valueB);
        }
        if (data.operation && data.operation !== operation) {
            setOperation(data.operation);
        }
    }, [data.valueA, data.valueB, data.operation, a, b, operation]);


    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const numericValue = Number(newValue);
        // Nếu giá trị không phải số, mặc định là 0
        const finalValue = isNaN(numericValue) ? 0 : numericValue;

        if (e.target.name === 'inputA') {
            setA(finalValue);

            data.onChange?.({ valueA: finalValue });
        } else if (e.target.name === 'inputB') {
            setB(finalValue);
            data.onChange?.({ valueB: finalValue });
        }
    }, [data.onChange]);


    const handleOperationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOperation = e.target.value as Operation;
        setOperation(newOperation);

        data.onChange?.({ operation: newOperation });
    }, [data.onChange]);

    const calculateResult = useMemo(() => {
        switch (operation) {
            case ADD:
                return a + b;
            case SUBTRACT:
                return a - b;
            case MULTIPLY:
                return a * b;
            default:
                return a + b;
        }
    }, [a, b, operation]);

    const highlightedNodeStyle = useMemo(() => ({
        padding: '15px',
        borderRadius: '8px',
        border: `2px solid ${isRunning ? '#EF4444' : '#d3d3d3'}`,
        textAlign: 'center',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        minWidth: '200px',
    }), [isRunning]);


    const inputStyle: React.CSSProperties = {
        padding: '10px',
        margin: '8px 5px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '1em',
        backgroundColor: '#f8f9fa',
        color: '#495057',
        boxSizing: 'border-box',
        width: 'calc(50% - 10px)', 
    };

    const selectStyle: React.CSSProperties = {
        padding: '10px',
        margin: '8px 5px',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        fontSize: '1em',
        backgroundColor: '#fff',
        color: '#495057',
        boxSizing: 'border-box',
        width: 'calc(100% - 10px)',
    };

    const resultStyle: React.CSSProperties = {
        marginTop: '15px',
        padding: '12px 15px',
        backgroundColor: '#e7f5ff',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '1.1em',
        color: '#212529',
        textAlign: 'center',
    };

    const handleLabelStyle: React.CSSProperties = {
        position: 'absolute',
        fontSize: '0.65em',
        color: '#555',
        fontWeight: 'bold',
        bottom: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
    };

    const getOperationSymbol = (op: Operation) => {
        switch (op) {
            case ADD: return '➕';
            case SUBTRACT: return '➖';
            case MULTIPLY: return '✖️';
            default: return '';
        }
    };

    return (
        <div style={highlightedNodeStyle as React.CSSProperties}>
            <strong><span role="img" aria-label="calculator">🧮</span> Calculator</strong>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <input
                    type="number"
                    disabled
                    value={a}
                    name='inputA'
                    onChange={handleValueChange}
                    style={inputStyle}
                    aria-label="Input A"
                />
                <input
                    type="number"
                    disabled
                    value={b}
                    name='inputB'
                    onChange={handleValueChange}
                    style={inputStyle}
                    aria-label="Input B"
                />
            </div>

            <select
                name="operation"
                value={operation}
                onChange={handleOperationChange}
                style={selectStyle}
                aria-label="Select Operation"
            >
                <option value="add">Add {getOperationSymbol(ADD)}</option>
                <option value="subtract">Subtract {getOperationSymbol(SUBTRACT)}</option>
                <option value="multiply">Multiply {getOperationSymbol(MULTIPLY)}</option>
            </select>

            <div style={resultStyle}>
                Result: {calculateResult}
            </div>

            <Handle
                id="inputA"
                type="target"
                position={Position.Top}
                style={{ background: '#00bcd4', width: 12, height: 12, borderRadius: '50%', border: '2px solid #fff', top: -6, left: '25%' }}
            >
                <span style={handleLabelStyle}>Input A</span>
            </Handle>

            <Handle
                id="inputB"
                type="target"
                position={Position.Top}
                style={{ background: '#00bcd4', width: 12, height: 12, borderRadius: '50%', border: '2px solid #fff', top: -6, left: '75%' }}
            >
                <span style={handleLabelStyle}>Input B</span>
            </Handle>
        </div>
    );
};

export default CalculatorNode;
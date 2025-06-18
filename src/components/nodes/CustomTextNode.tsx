import React, { useCallback, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomTextNodeData {
  value: string;
  isRunning?: boolean;
  onChange?: (newValue: string) => void;
}

const CustomTextNode: React.FC<NodeProps<CustomTextNodeData>> = ({ id, data }) => {
  const isRunning = data?.isRunning;
  const [inputValue, setInputValue] = useState<string>(data.value || '');
  const [isValidJson, setIsValidJson] = useState<boolean>(true);

  useEffect(() => {
    setInputValue(data.value || '');
    try {
      if (data.value) {
        JSON.parse(data.value);
        setIsValidJson(true);
      } else {
        setIsValidJson(true);
      }
    } catch (e) {
      setIsValidJson(false);
    }
  }, [data.value, inputValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    try {
      if (newValue.trim() === '') {
        setIsValidJson(true);
        data.onChange?.(newValue);
      } else {
        JSON.parse(newValue);
        setIsValidJson(true);
        data.onChange?.(newValue);
      }
    } catch (error) {
      setIsValidJson(false);
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
      <strong>📝 Text Input</strong>
      <textarea
        value={inputValue}
        placeholder="Enter JSON here (e.g., {'key': 'value'})"
        onChange={handleChange}
        rows={6}
        style={{
          width: 'calc(100% - 10px)',
          marginTop: 8,
          padding: 5,
          border: isValidJson ? '1px solid #ccc' : '1px solid #ff0000',
          borderRadius: 4,
          resize: 'vertical',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
        className="nodrag"
      />
      {!isValidJson && (
        <div style={{ color: '#ff0000', fontSize: '0.8em', marginTop: 5 }}>
          Invalid JSON format!
        </div>
      )}
      <Handle type="target" position={Position.Left} style={{ border: '1px solid #333', background: '#00bcd4', width: 10, height: 10, borderRadius: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ border: '1px solid #333', background: '#28a745', width: 10, height: 10, borderRadius: '50%' }} />
    </div>
  );
};

export default CustomTextNode;


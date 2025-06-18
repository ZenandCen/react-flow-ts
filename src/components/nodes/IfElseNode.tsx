import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

const IfElseNode: React.FC<NodeProps> = ({ id, data }) => {
  const isRunning = data?.isRunning;

  const highlightedNodeStyle = (id: string) => ({
    border: isRunning ? '2px solid red' : '1px solid #666',
    borderColor: isRunning ? 'red' : '#777',
    borderRadius: 10,
    padding: 10
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debugger
    data.onChange?.({ label: e.target.value });
  };

  return (
    <div style={highlightedNodeStyle(id)}>
      <strong>🔀 If/Else</strong>
      <div>Condition: <code>true</code></div>
      <input
        type="output"
        placeholder="Condition"
        value={data.condition || ''}
        onChange={handleChange}
        style={{ width: '100%', marginTop: 8 }}
      />
      <Handle style={{ border: '1px solid #333', background: '#00bcd4', width: 10, height: 10, borderRadius: '50%' }} type="target" position={Position.Left} />

      <Handle style={{ border: '1px solid #333', left: '25%', background: '#28a745', width: 10, height: 10, borderRadius: '50%' }} id="true-output" type="source" position={Position.Bottom} isConnectable={true}>
        <span style={{ position: 'absolute', fontSize: '10px', color: '#555', fontWeight: 'bold', bottom: '-20px', left: '0' }}>True</span>
      </Handle>
      <Handle style={{ border: '1px solid #333', left: '75%', background: '#dc3545', width: 10, height: 10, borderRadius: '50%' }} id="false-output" type="source" position={Position.Bottom} isConnectable={true}>
        <span style={{ position: 'absolute', fontSize: '10px', color: '#555', fontWeight: 'bold', bottom: '-20px', right: '0' }}>False</span>
      </Handle>
    </div>
  );
};

export default IfElseNode;

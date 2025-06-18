import React, { useState, useEffect, useCallback } from 'react';

import { NodeProps, Handle, Position } from 'reactflow';

interface ScheduleNodeData {
  label?: string;
  cron?: string;
  delaySeconds?: number;

  repeatIntervalValue?: number;
  repeatIntervalUnit?: 'seconds' | 'minutes' | 'hours';
  repeatCount?: number;

  isRunning?: boolean; // Trạng thái đang chạy
  onChange?: (newData: Partial<ScheduleNodeData>) => void;
}
const ScheduleNode: React.FC<NodeProps> = ({ id, data }) => {
  const isRunning = data?.isRunning;
  const [delayInput, setDelayInput] = useState<number>(data.delaySeconds ?? 0);

  // States cục bộ mới cho interval
  const [intervalValueInput, setIntervalValueInput] = useState<number>(data.repeatIntervalValue ?? 0);
  const [intervalUnitInput, setIntervalUnitInput] = useState<ScheduleNodeData['repeatIntervalUnit']>(data.repeatIntervalUnit || 'seconds');
  const [repeatCountInput, setRepeatCountInput] = useState<number>(data.repeatCount ?? 0); // 0 = vô hạn

  useEffect(() => {
    if (typeof data.delaySeconds === 'number' && data.delaySeconds !== delayInput) {
      setDelayInput(data.delaySeconds);
    }
  }, [data.delaySeconds]);

  useEffect(() => {
    if (typeof data.repeatIntervalValue === 'number' && data.repeatIntervalValue !== intervalValueInput) {
      setIntervalValueInput(data.repeatIntervalValue);
    }
    if (data.repeatIntervalUnit && data.repeatIntervalUnit !== intervalUnitInput) {
      setIntervalUnitInput(data.repeatIntervalUnit);
    }
    if (typeof data.repeatCount === 'number' && data.repeatCount !== repeatCountInput) {
      setRepeatCountInput(data.repeatCount);
    }
  }, [data.delaySeconds,data.repeatIntervalValue, data.repeatIntervalUnit, data.repeatCount, intervalValueInput, intervalUnitInput, repeatCountInput]);

  // Delay
  const handleDelayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numericValue = Number(newValue);

    const finalValue = isNaN(numericValue) ? (newValue === '' ? undefined : 0) : numericValue;

    setDelayInput(finalValue === undefined ? 0 : finalValue);

    if (data.onChange) {
      data.onChange({ delaySeconds: finalValue });
    }
  }, [data.onChange]);

// InterVal
  const handleIntervalValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numericValue = Number(newValue);
    const finalValue = isNaN(numericValue) ? (newValue === '' ? undefined : 0) : numericValue;
    setIntervalValueInput(finalValue === undefined ? 0 : finalValue);
    if (data.onChange) {
      data.onChange({ repeatIntervalValue: finalValue });
    }
  }, [data.onChange]);

  const handleIntervalUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as ScheduleNodeData['repeatIntervalUnit'];
    setIntervalUnitInput(newUnit);
    if (data.onChange) {
      data.onChange({ repeatIntervalUnit: newUnit });
    }
  }, [data.onChange]);

  const handleRepeatCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numericValue = Number(newValue);
    const finalValue = isNaN(numericValue) ? (newValue === '' ? undefined : 0) : numericValue;
    setRepeatCountInput(finalValue === undefined ? 0 : finalValue);
    if (data.onChange) {
      data.onChange({ repeatCount: finalValue });
    }
  }, [data.onChange]);

  const highlightedNodeStyle = (id: string) => ({
    border: isRunning ? '2px solid red' : '1px dotted #444',
    borderColor: isRunning ? 'red' : '#777',
    borderRadius: 10,
    padding: 10,
  });

  return (
    <div style={highlightedNodeStyle(id)}>
      <strong>🕒 Schedule</strong>
      {/* Interval */}
      <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
        <strong style={{ fontSize: '0.9em' }}>🔁 Repeat Interval</strong>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <input
            id={`interval-value-${id}`}
            type="number"
            value={intervalValueInput === 0 && data.repeatIntervalValue === undefined ? '' : intervalValueInput}
            onChange={handleIntervalValueChange}
            placeholder="0"
            min="1"
            style={{ width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', marginRight: 5 }}
            className="nodrag"
          />
          <select
            id={`interval-unit-${id}`}
            value={intervalUnitInput}
            onChange={handleIntervalUnitChange}
            style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            className="nodrag"
          >
            <option value="seconds">Seconds</option>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>
        <div style={{ marginTop: 10 }}>
          <label htmlFor={`repeat-count-${id}`} style={{ fontSize: '0.85em', display: 'block', marginBottom: 4 }}>Repeat Count (0 for infinite):</label>
          <input
            id={`repeat-count-${id}`}
            type="number"
            value={repeatCountInput === 0 && data.repeatCount === undefined ? '' : repeatCountInput}
            onChange={handleRepeatCountChange}
            placeholder="0"
            min="1"
            style={{ width: 'calc(100% - 10px)', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            className="nodrag"
          />
        </div>
      </div>
      {/* Handle */}
      <Handle
        id="inputSchedule"
        style={{ background: '#28a745', width: 10, height: 10, borderRadius: '50%' }}
        type="source"
        position={Position.Right} />
    </div>
  );
};

export default ScheduleNode;

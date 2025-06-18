import React, { useState, useCallback, useEffect } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { performHttpRequestLogic, HttpMethod } from '../../utils/apiService'; // Đảm bảo đúng đường dẫn
import axios from 'axios';

interface HttpRequestNodeData {
  isRunning?: boolean; // Trạng thái đang chạy
  id: string; // ID của node
  label?: string; // Nhãn của node
  url: string; // URL của API
  method: HttpMethod; // Phương thức HTTP
  headers: string; // Headers dưới dạng JSON string
  body: string; // Body dưới dạng JSON string hoặc text

  lastResponse?: any;
  lastStatus?: number;
  lastError?: any;

  onChange?: (newData: Partial<HttpRequestNodeData>) => void;
}

const HttpRequestNode: React.FC<NodeProps<HttpRequestNodeData>> = ({ id, data }) => {
  const { url, method, headers, body, label, isRunning, lastResponse, lastStatus, lastError, onChange } = data;
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const performHttpRequest = useCallback(async (
    requestUrl: string,
    requestMethod: HttpMethod = 'GET',
    requestHeaders: string = '{}',
    requestBody: string | undefined
  ): Promise<{ success: boolean; data?: any; error?: any; status?: number; headers?: any }> => {
    return performHttpRequestLogic(requestUrl, requestMethod, requestHeaders, requestBody);
  }, []);

  const handleTestRequest = useCallback(async () => {
    setTestResult('Testing...');
    setIsTesting(true);

    const testRes = await performHttpRequest(
      url || '',
      method || 'GET',
      headers || '',
      body || ''
    );

    if (testRes.success) {
      setTestResult(
        `Status: ${testRes.status}\n` +
        `Data:\n${JSON.stringify(testRes.data, null, 2)}`
      );
    } else {
      setTestResult(
        `Error: ${testRes.error.message}\n` +
        `Status: ${testRes.error.status || 'N/A'}\n` +
        `Response Data:\n${JSON.stringify(testRes.error.data, null, 2) || 'N/A'}`
      );
    }
    setIsTesting(false);
  }, [url, method, headers, body, performHttpRequest]);

  const handleDataChange = useCallback((key: keyof HttpRequestNodeData, value: any) => {
    if (onChange) {
      onChange({ [key]: value });
    }
  }, [onChange]);

  const nodeClasses = `react-flow__node react-flow__node-httpRequestNode ${data.isRunning ? 'running' : ''}`;


  const highlightedNodeStyle = (id: string) => ({
    border: isRunning ? '2px solid red' : '1px solid #00bcd4',
    borderColor: isRunning ? 'red' : '#e0f7fa',
    borderRadius: 10,
    padding: 15,
    fontFamily: 'sans-serif',
    fontSize: 14,
    minWidth: 350,
    maxWidth: 350,

  });

  return (
    <div style={highlightedNodeStyle(id)}>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ border: '1px solid #333',background: '#00bcd4', width: 10, height: 10, borderRadius: '50%' }}
        isConnectable={true}
      />

      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ marginRight: 8, fontSize: 20 }}>📡</span>
        <strong>HTTP Request</strong>
      </div>

      <div>
        <label style={{ fontSize: '0.8em', display: 'block', marginBottom: 4 }}>URL:</label>
        <input
          type="text"
          value={url || ''}
          onChange={(e) => handleDataChange('url', e.target.value)}
          placeholder="https://api.openweathermap.org/data/2.5/weather?q=Ho Chi Minh City,vn&appid=22ab4e74d9c3ae0513dab6dc0895c8d1&units=metric&lang=vi"
          style={{ width: 'calc(100% - 10px)', padding: 5, border: '1px solid #ccc', borderRadius: 4 }}
          className="nodrag"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ fontSize: '0.8em', display: 'block', marginBottom: 4 }}>Method:</label>
        <select
          value={method || 'GET'}
          onChange={(e) => handleDataChange('method', e.target.value as HttpRequestNodeData['method'])}
          style={{ width: '100%', padding: 5, border: '1px solid #ccc', borderRadius: 4 }}
          className="nodrag"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ fontSize: '0.8em', display: 'block', marginBottom: 4 }}>Headers (JSON):</label>
        <textarea
          value={headers || ''}
          onChange={(e) => handleDataChange('headers', e.target.value)}
          placeholder='{"Content-Type": "application/json"}'
          rows={3}
          style={{ width: 'calc(100% - 10px)', padding: 5, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
          className="nodrag"
        />
      </div>

      {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: '0.8em', display: 'block', marginBottom: 4 }}>Body (JSON/Text):</label>
          <textarea
            value={body || ''}
            onChange={(e) => handleDataChange('body', e.target.value)}
            placeholder='{"key": "value"}'
            rows={4}
            style={{ width: 'calc(100% - 10px)', padding: 5, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
            className="nodrag"
          />
        </div>
      )}

      <button
        onClick={handleTestRequest}
        style={{
          marginTop: 15,
          padding: '8px 15px',
          borderRadius: 4,
          border: '1px solid #007bff',
          background: '#007bff',
          color: 'white',
          cursor: 'pointer',
          width: '100%',
        }}
        className="nodrag"
      >
        {isTesting ? 'Testing...' : 'Test Request'}
      </button>

      {testResult && (
        <div style={{ marginTop: 15, padding: 10, background: '#f8f8f8', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.85em', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 150, overflowY: 'auto' }}>
          <strong>Test Result:</strong>
          <pre style={{ margin: 0, padding: 0, overflowX: 'auto' }}>{testResult}</pre>
        </div>
      )}

      {lastResponse && (
        <div style={{ marginTop: 10, padding: 8, background: '#e0ffe0', border: '1px solid #c8e6c9', borderRadius: 4, fontSize: '0.8em' }}>
          <strong>Flow Result:</strong>
          <pre style={{ margin: 0, padding: 0, overflowX: 'auto', maxHeight: 150 }}>{JSON.stringify(data.lastResponse, null, 2)}</pre>
        </div>
      )}

      {lastError && (
        <div style={{ marginTop: 10, padding: 8, background: '#ffe0e0', border: '1px solid #ffcdd2', borderRadius: 4, fontSize: '0.8em', color: '#d32f2f' }}>
          <strong>Flow Error:</strong>
          <pre style={{ margin: 0, padding: 0, overflowX: 'auto' }}>{JSON.stringify(data.lastError, null, 2)}</pre>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="success-output"
        style={{ border: '1px solid #333',left: '25%', background: '#28a745', width: 10, height: 10, borderRadius: '50%' }}
        isConnectable={true}
      >
        <span className="handle-label" style={{ position: 'absolute', fontSize: '10px', color: '#555', fontWeight: 'bold', bottom: '-20px', left: '0' }}>Success</span>
      </Handle>

      <Handle
        type="source"
        position={Position.Bottom}
        id="error-output"
        style={{ border: '1px solid #333',left: '75%', background: '#dc3545', width: 10, height: 10, borderRadius: '50%' }}
        isConnectable={true}
      >
        <span className="handle-label" style={{ position: 'absolute', fontSize: '10px', color: '#555', fontWeight: 'bold', bottom: '-20px', right: '0' }}>Error</span>
      </Handle>
    </div>
  );
};

export default HttpRequestNode;
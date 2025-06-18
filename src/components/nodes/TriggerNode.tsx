import React, { useCallback } from 'react';
import { NodeProps, Handle, Position, Connection, useReactFlow } from 'reactflow';

const TriggerNode: React.FC<NodeProps> = ({ id, data }) => {

    const { getEdges } = useReactFlow();

    const isValidConnection = useCallback((connection: Connection): boolean => {
        if (connection.source === id) {
            const existingEdges = getEdges();
            const edgesFromThisHandle = existingEdges.filter(
                (edge) => edge.source === id && edge.sourceHandle === connection.sourceHandle
            );
        }
        return true;
    }, [id, getEdges]);

    const isRunning = data?.isRunning;

    const highlightedNodeStyle = (id: string) => ({
        border: isRunning ? '2px solid red' : '1px solid #ccc',
        borderColor: isRunning ? 'red' : '#777',
        borderRadius: 10,
        padding: 10,
    });
    return (
        <div style={highlightedNodeStyle(id)}>
            <strong>⚡ Trigger</strong>
            <div>Start of Flow</div>
            <Handle
                style={{ border: '1px solid #333', background: '#28a745', width: 10, height: 10, borderRadius: '50%' }}
                type="source"
                position={Position.Right}
                isConnectable={true}
                isValidConnection={isValidConnection} />
        </div>
    );
};

export default TriggerNode;

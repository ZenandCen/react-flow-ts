import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

interface CustomEdgeData {
    label?: string;
    isActive?: boolean;
    isSuccess?: boolean;
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeColor = data?.isSuccess == true ? '#28a745' : data?.isSuccess == false ? '#dc3545' :  '#b1b1b7'; // Xanh cho success, đỏ cho fail
  const strokeWidth = data?.isSuccess ? 1 : 1; // Độ dày

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: strokeWidth,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              pointerEvents: 'all',
              whiteSpace: 'nowrap',
              color: edgeColor,
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
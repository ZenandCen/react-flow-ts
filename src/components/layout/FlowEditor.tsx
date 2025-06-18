import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    useEdgesState,
    useNodesState,
    ReactFlowProvider,
    NodeChange,
} from 'reactflow';

import CustomEdge from './edges/CustomEdge';
import 'reactflow/dist/style.css';
import './css/FlowEditor.css';
import Sidebar from "./Sidebar";
import FlowSettings from '../settings/FlowSettings'; // Import FlowSettings
import { useDrop } from 'react-dnd';
import _ from 'lodash';
import { performHttpRequestLogic, HttpMethod } from '../../utils/apiService';
import { toast } from 'react-toastify';

interface FlowSettingsState {
    panOnDrag: boolean;
    panOnScroll: boolean;
    zoomOnPinch: boolean;
    zoomOnDoubleClick: boolean;
    zoomOnScroll: boolean;
    fitViewPadding: number;
    fitViewMinZoom: number;
    fitViewMaxZoom: number;
}

// --- Constants ---
const EDGE_TYPE_SMOOTHSTEP = 'smoothstep';
const EDGE_TYPE_SUCCESS = 'successEdge';
const EDGE_TYPE_ERROR = 'errorEdge';
const EDGE_TYPE_DEFAULT = 'default';

const HANDLE_TRUE_OUTPUT = 'true-output';
const HANDLE_FALSE_OUTPUT = 'false-output';
const HANDLE_SUCCESS_OUTPUT = 'success-output';
const HANDLE_ERROR_OUTPUT = 'error-output';

const NODE_TYPE_TRIGGER = 'triggerNode';
const NODE_TYPE_SCHEDULE = 'scheduleNode';
const NODE_TYPE_CUSTOM_NUMBER = 'customNumberNode';
const NODE_TYPE_CALCULATOR = 'calculatorNode';
const NODE_TYPE_IF_ELSE = 'ifElseNode';
const NODE_TYPE_HTTP_REQUEST = 'httpRequestNode';
const NODE_TYPE_WEATHER = 'weatherNode';

let idCounter = 0;
const getId = () => `node_${idCounter++}`;

const nodeTypes = {
    calculatorNode: React.lazy(() => import('../nodes/CalculatorNode')),
    customTextNode: React.lazy(() => import('../nodes/CustomTextNode')),
    customNumberNode: React.lazy(() => import('../nodes/CustomNumberNode')),
    scheduleNode: React.lazy(() => import('../nodes/ScheduleNode')),
    ifElseNode: React.lazy(() => import('../nodes/IfElseNode')),
    weatherNode: React.lazy(() => import('../nodes/WeatherNode')),
    triggerNode: React.lazy(() => import('../nodes/TriggerNode')),
    httpRequestNode: React.lazy(() => import('../nodes/HttpRequestNode')),
};

const customEdgeTypes = {
    default: CustomEdge,
    smoothstep: CustomEdge,
    straight: CustomEdge,
    step: CustomEdge,
    myCustomEdge: CustomEdge,
    successEdge: CustomEdge,
    errorEdge: CustomEdge,
};

const ChevronLeftIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={color}
        width={size}
        height={size}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={color}
        width={size}
        height={size}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const FlowEditor: React.FC = () => {
    //state
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChangeReactFlow] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
    const repeatCountRef = useRef<number>(0);
    const intervalRef = useRef<number | null>(null);
    const [isFlowLocked, setIsFlowLocked] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [flowSettings, setFlowSettings] = useState<FlowSettingsState>({
        panOnDrag: true,
        panOnScroll: false,
        zoomOnPinch: true,
        zoomOnDoubleClick: true,
        zoomOnScroll: true,
        fitViewPadding: 0.1,
        fitViewMinZoom: 0.5,
        fitViewMaxZoom: 2,
    });

    // Callback để cập nhật các cài đặt flow
    const handleFlowSettingsChange = useCallback((newSettings: Partial<FlowSettingsState>) => {
        setFlowSettings((prevSettings: any) => ({
            ...prevSettings,
            ...newSettings,
        }));
    }, []);

    // --- Memoized Callbacks for React Flow ---
    const onConnect = useCallback((params: Connection) => {
        const newEdge = { ...params, type: EDGE_TYPE_SMOOTHSTEP };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    // Update node data
    const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...newData,
                        },
                    };
                }
                return node;
            })
        );
    }, [setNodes]);

    // Update edge state utility
    const updateEdgeState = useCallback((
        edgeId: string,
        newType: string,
        isActive: boolean,
        isSuccess?: boolean
    ) => {
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === edgeId) {
                    return {
                        ...e,
                        type: newType,
                        data: {
                            ...(e.data || {}),
                            isActive: isActive,
                            ...(typeof isSuccess !== 'undefined' && { isSuccess: isSuccess }),
                        },
                    };
                }
                return e;
            })
        );
    }, [setEdges]);

    const memoizedOnExecuteForHttpRequest = useCallback(async (
        url: string,
        method: HttpMethod,
        headers: string = '{}',
        body: string = '{}'
    ) => {
        return performHttpRequestLogic(url, method, headers, body);
    }, []);

    const convertToMs = (value: number, unit: 'seconds' | 'minutes' | 'hours'): number => {
        switch (unit) {
            case 'seconds': return value * 1000;
            case 'minutes': return value * 60 * 1000;
            case 'hours': return value * 60 * 60 * 1000;
            default: return value * 1000;
        }
    };

    const executeFlow = useCallback(async (triggerNodeId: string) => {
        if (executingNodeId) {
            console.warn("An execution is already in progress. Skipping this iteration.");
            return;
        }

        // Start from Trigger node
        const sourceNodeIds = edges.map(e => e.source);

        // Wait for the user-defined delay before starting execution
        const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
        let visited = new Set<string>();

        const dfs = async (id: string, incomingData: any = undefined) => {
            if (visited.has(id)) return;
            visited.add(id);

            setExecutingNodeId(id);
            await delay(600); // Use delayInput here

            const currentNode = nodeMap[id];
            if (!currentNode) {
                console.error(`Node with ID ${id} not found.`);
                return;
            }

            const currentData = currentNode?.data;

            let result: any = undefined;
            let nextEdgeSourceHandle: string | undefined = undefined;

            // --- Node specific execution logic ---
            switch (currentNode?.type) {
                case NODE_TYPE_CUSTOM_NUMBER:
                    result = incomingData !== undefined ? incomingData : currentData?.value;
                    break;

                case NODE_TYPE_IF_ELSE:
                    const conditionToEvaluate = incomingData !== undefined ? incomingData : currentData?.condition;
                    const conditionResult = conditionToEvaluate && String(conditionToEvaluate).includes('true') || Math.random() > 0.5;
                    result = conditionResult;
                    onNodeDataChange(currentNode.id, { result: result });
                    nextEdgeSourceHandle = result ? HANDLE_TRUE_OUTPUT : HANDLE_FALSE_OUTPUT;
                    break;

                case NODE_TYPE_HTTP_REQUEST:
                    console.log(`Executing HTTP Request for node ${id} via its onExecute callback...`);

                    const requestResult = await currentData.onExecute(
                        currentData.url,
                        currentData.method,
                        currentData.headers,
                        currentData.body
                    );

                    result = requestResult;
                    if (requestResult.success) {
                        onNodeDataChange(currentNode.id, { lastResponse: requestResult.data, lastError: null, lastStatus: requestResult.status });
                        nextEdgeSourceHandle = HANDLE_SUCCESS_OUTPUT;
                    } else {
                        onNodeDataChange(currentNode.id, { lastError: requestResult.error, lastResponse: null });
                        nextEdgeSourceHandle = HANDLE_ERROR_OUTPUT;
                    }
                    break;
                default:
                    result = incomingData; // Default: pass incoming data through
                    break;
            }

            // --- Traverse Edges ---
            const nextEdges = edges.filter(e => e.source === id);

            for (const edge of nextEdges) {
                const nextId = edge.target;
                const nextNode = nodeMap[nextId];
                if (!nextNode) {
                    console.warn(`Target node ${nextId} for edge ${edge.id} not found. Skipping.`);
                    continue;
                }
                const nextData = nextNode?.data;


                switch (currentNode?.type) {
                    case 'triggerNode':
                    case 'scheduleNode':
                        {
                            console.log(`Skipping Trigger/Schedule Node: ${nextNode.id}`);
                            updateEdgeState(edge.id, EDGE_TYPE_SUCCESS, true, true);
                            await dfs(nextId, result); // Vẫn gọi dfs để tiếp tục với các node khác
                        }
                        break;
                    case 'ifElseNode':
                    case 'httpRequestNode':
                        {
                            if (edge.sourceHandle === nextEdgeSourceHandle) {
                                updateEdgeState(
                                    edge.id,
                                    (nextEdgeSourceHandle === HANDLE_TRUE_OUTPUT || nextEdgeSourceHandle === HANDLE_SUCCESS_OUTPUT) ? EDGE_TYPE_SUCCESS : EDGE_TYPE_ERROR,
                                    true, // isActive
                                    true  // isSuccess
                                );
                                await dfs(edge.target, result); // Tiếp tục DFS qua nhánh này
                            } else {
                                updateEdgeState(edge.id, EDGE_TYPE_ERROR, false, false); // isActive: false, isSuccess: false
                                setExecutingNodeId(null);
                                continue;
                            }
                        }
                        break;
                    default:
                        {
                            updateEdgeState(edge.id, EDGE_TYPE_SUCCESS, true, true);
                            await dfs(edge.target, result); // Tiếp tục DFS
                        }
                        break;
                }
                // Logic for handling data updates on target nodes based on their type
                switch (nextNode?.type) {
                    case NODE_TYPE_CALCULATOR:
                        {
                            if (nextData && result !== undefined) {
                                const targetHandle = edges?.find(e => e.target === nextNode?.id && e.source === currentNode?.id)?.targetHandle
                                if (targetHandle === 'inputA' && nextData.onChange) {
                                    onNodeDataChange(nextNode.id, { valueA: result });
                                }
                                else if (targetHandle === 'inputB' && nextData.onChange) {
                                    onNodeDataChange(nextNode.id, { valueB: result });
                                }
                            }
                        }
                        break;
                    case NODE_TYPE_CUSTOM_NUMBER:
                        {
                            if (!_.isNil(result)) {
                                // nextData?.onChange?.({ value: result });
                                onNodeDataChange(nextNode.id, { value: result });
                            }
                        }
                        break;
                    case NODE_TYPE_WEATHER:
                        {
                            if (result && result.success) {
                                onNodeDataChange(nextNode.id, { lastResponse: result.data, lastStatus: result.lastStatus });
                            } else {
                                onNodeDataChange(nextNode.id, { lastResponse: null, lastStatus: null, lastError: currentNode?.data?.lastError });
                            }
                        }
                        break;
                    default:
                        break;
                }

                await dfs(nextId, result);
            }
        };

        const initialTriggerNode = nodes.find(n => sourceNodeIds.includes(n.id) && (n.type === NODE_TYPE_TRIGGER || n.type === NODE_TYPE_SCHEDULE));
        if (!initialTriggerNode) {
            toast.info('No Trigger Node or Schedule Node found to start the flow!');
            return;
        }

        await dfs(triggerNodeId);
        setExecutingNodeId(null);
    }, [nodes, edges, onNodeDataChange, setExecutingNodeId, delay, updateEdgeState]);

    // --- Loop Management ---
    const stopLoop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null
            repeatCountRef.current = 0;
            setExecutingNodeId(null)
            setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, isRunning: false } }))); // Tắt highlight tất cả node
            setIsFlowLocked(false); //Unblock flow changes
            console.log("Flow loop stopped.");
        }
    }, []);

    const startLoop = useCallback(async () => {
        // Clear bất kỳ interval cũ nào để tránh chạy nhiều lần
        if (intervalRef.current) {
            console.warn("A loop is already active. Stop it first to start a new one.");
            return;
        }
        setIsFlowLocked(true); //Block flow startLoop

        const triggerNodes = nodes.filter(n => edges.some(e => e.source === n.id) && (n.type === NODE_TYPE_TRIGGER || n.type === NODE_TYPE_SCHEDULE));
        if (!triggerNodes || triggerNodes.length === 0) {
            toast.info('Please add a Trigger Node or Schedule Node to use looping!');
            setIsFlowLocked(false); // Open block when meet error
            return;
        }

        if (triggerNodes.length > 1) {
            toast.info('Please use only one Trigger Node or Schedule Node!');
            setIsFlowLocked(false); // Open block when meet error
            return;
        }

        const triggerNode = triggerNodes[0];
        if (!triggerNode.data) {
            toast.info('Trigger Node or Schedule Node must have data!');
            setIsFlowLocked(false); // Open block when meet error
            return;
        }

        if (triggerNode.type === NODE_TYPE_TRIGGER) {
            await executeFlow(triggerNode.id);
            console.log("Manual Trigger flow completed.");
            setIsFlowLocked(false); // Open block flow changes
            return;
        }

        // Handle Schedule Node: setup interval
        const { repeatIntervalValue, repeatIntervalUnit, repeatCount, delaySeconds } = triggerNode.data;
        let intervalMs = 0;
        if (typeof repeatIntervalValue === 'number' && repeatIntervalValue > 0 && repeatIntervalUnit) {
            intervalMs = convertToMs(repeatIntervalValue, repeatIntervalUnit);
        } else {
            toast.info('For Schedule Node, please set a valid Repeat Interval (value > 0 and unit)!');
            setIsFlowLocked(false); // Open block when meet error
            return;
        }

        if (typeof delaySeconds === 'number' && delaySeconds > 0) {
            await delay(delaySeconds * 1000);
        }

        repeatCountRef.current = 0;

        const loopFunction = async () => {
            const currentTriggerNode = nodes.find(n => n.id === triggerNode.id);
            const maxRepeatCount = currentTriggerNode?.data?.repeatCount;

            if (executingNodeId) {
                console.warn("Another flow is currently executing. Please wait until it finishes.");
                return;
            }

            if (maxRepeatCount && maxRepeatCount > 0 && repeatCountRef.current >= maxRepeatCount) {
                console.log(`Loop finished after ${repeatCountRef.current} iterations (max: ${maxRepeatCount}).`);
                stopLoop();
                return;
            }

            console.log(`Executing flow (Iteration ${repeatCountRef.current + 1})...`);
            await executeFlow(triggerNode.id);
            repeatCountRef.current++;
        };

        await loopFunction();// Execute immediately once
        const id = window.setInterval(loopFunction, intervalMs); // Sử dụng window.setInterval để có type number
        intervalRef.current = id;
        console.log(`Flow scheduled to repeat every ${repeatIntervalValue} ${repeatIntervalUnit}. Interval ID: ${id}`);

    }, [nodes, edges, executeFlow, convertToMs, delay, stopLoop, executingNodeId]);

    // --- DnD Drop handling ---
    const [, drop] = useDrop({
        accept: 'node',
        drop: useCallback((item: any, monitor: any) => {
            const offset = monitor.getClientOffset();
            const bounds = reactFlowWrapper.current?.getBoundingClientRect();

            if (!bounds || !offset) return;

            const position = {
                x: offset.x - bounds.left,
                y: offset.y - bounds.top,
            };

            const id = getId();
            let nodeData: any = { label: item.type };

            switch (item.type) {
                case NODE_TYPE_TRIGGER:
                    nodeData = {
                    };
                    break;
                case NODE_TYPE_SCHEDULE:
                    nodeData = {
                        cron: '0 8 * * *',
                        delaySeconds: 0,
                        repeatIntervalValue: 1,
                        repeatIntervalUnit: 'seconds',
                        repeatCount: 1,
                    };
                    break;
                case NODE_TYPE_CUSTOM_NUMBER:
                    nodeData = {
                        value: 0,
                    };
                    break;
                case NODE_TYPE_CALCULATOR:
                    nodeData = {
                        valueA: 0,
                        valueB: 0,
                    };
                    break;
                case NODE_TYPE_IF_ELSE:
                    nodeData = {
                        condition: true,
                    };
                    break;
                case NODE_TYPE_HTTP_REQUEST:
                    nodeData = {
                        label: '🌐 HTTP Request',
                        url: '',
                        method: 'GET',
                        headers: '',
                        body: '',

                        lastResponse: null,
                        lastStatus: null,
                        lastError: null,

                        onExecute: memoizedOnExecuteForHttpRequest,
                    };
                    break;
                case NODE_TYPE_WEATHER:
                    nodeData = {
                        lastResponse: null,
                        lastStatus: null,
                        lastError: null,
                    };
                    break;
                default:
                    nodeData = {
                    };
                    break;
            }

            const newNode: Node = {
                id,
                type: item.type,
                position,
                data: {
                    ...nodeData,
                    onChange: (updatedValues: any) => onNodeDataChange(id, updatedValues),
                    ...(item.type !== NODE_TYPE_HTTP_REQUEST && {
                        onExecute: (url: string, method: HttpMethod, headers: any, body: any) =>
                            performHttpRequestLogic(url, method, headers, body)
                    })
                },
            };

            setNodes((nds) => nds.concat(newNode));
        }, [memoizedOnExecuteForHttpRequest, onNodeDataChange, setNodes]),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const saveFlow = () => {
        const flow = {
            nodes,
            edges,
        };
        localStorage.setItem('flow', JSON.stringify(flow));
        toast.success('Flow saved!');
    };

    const loadFlow = useCallback(() => {
        const saved = localStorage.getItem('flow');
        if (saved) {
            const flow = JSON.parse(saved);
            const loadedNodes = flow.nodes.map((node: Node) => ({
                ...node,
                data: {
                    ...node.data,
                    isRunning: false, // Reset running state on load
                    // Potentially reset lastResponse, lastError, etc. if you don't want them persistent
                },
            }));

            setNodes(loadedNodes || []);
            setEdges(flow.edges || []);
            toast.success('Flow loaded!');
        } else {
            toast.info('No saved flow found.');
        }
    }, [setNodes, setEdges]);

    const resetFlow = useCallback(() => {
        setNodes([]);
        setEdges([]);
        toast.info('Flow reset!');
    }, [setNodes, setEdges]);

    // --- Effects ---
    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Update node `isRunning` state
    useEffect(() => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                data: {
                    ...n.data,
                    isRunning: n.id === executingNodeId,
                },
            }))
        );
    }, [executingNodeId, setNodes]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        onNodesChangeReactFlow(changes);
    }, [onNodesChangeReactFlow]);
    return (

        <ReactFlowProvider>
            <div className="flow-editor-container">
                <Sidebar
                    isFlowLocked={isFlowLocked}
                    isSidebarOpen={isSidebarOpen}
                    // toggleSidebar={toggleSidebar}
                    repeatCount={repeatCountRef.current}
                    isLoopActive={intervalRef.current !== null}
                    flowSettings={flowSettings}
                    onFlowSettingsChange={handleFlowSettingsChange}
                />
                <button
                    onClick={toggleSidebar}
                    className={`sidebar-toggle-button ${isSidebarOpen ? 'opened' : 'closed'}`} // Thêm class để dễ style
                    disabled={isFlowLocked}
                >
                    {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </button>
                <div
                    className="reactflow-main-content"
                    style={{ flex: 1, height: '100%', position: 'relative' }}
                    ref={(el) => {
                        reactFlowWrapper.current = el;
                        drop(el);
                    }}
                >
                    <div className="flow-controls-bar">
                        <div className="flow-actions-group">
                            {intervalRef.current ? (
                                <button onClick={stopLoop} disabled={!isFlowLocked} className="stoploop-button">
                                    Stop Loop (Iteration: {repeatCountRef.current})
                                </button>
                            ) : (
                                <button onClick={startLoop} disabled={isFlowLocked} className="run-button">
                                    ▶ Run
                                </button>
                            )}
                            <button onClick={resetFlow} disabled={isFlowLocked} className="reset-button">Reset</button>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5em', color: 'var(--text-color-default)' }}>Flow Editor</h2>
                    </div>

                    <ReactFlow
                        nodeTypes={nodeTypes}
                        edgeTypes={customEdgeTypes}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}

                        panOnDrag={flowSettings.panOnDrag}
                        panOnScroll={flowSettings.panOnScroll}
                        zoomOnPinch={flowSettings.zoomOnPinch}
                        zoomOnDoubleClick={flowSettings.zoomOnDoubleClick}
                        zoomOnScroll={flowSettings.zoomOnScroll}
                        nodesDraggable={!isFlowLocked}
                        nodesConnectable={!isFlowLocked}
                        elementsSelectable={!isFlowLocked}

                        fitViewOptions={{
                            padding: flowSettings.fitViewPadding,
                            minZoom: flowSettings.fitViewMinZoom,
                            maxZoom: flowSettings.fitViewMaxZoom,
                        }}
                    >
                        <MiniMap />
                        <Background />
                        <Controls />
                    </ReactFlow>

                    {isFlowLocked && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 100, // 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'auto',
                            backdropFilter: 'blur(-3px)',
                            fontSize: '1.5em',
                            color: '#333',
                            fontWeight: 'bold',
                        }}>
                            Flow is executing...
                        </div>
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
};

export default FlowEditor;
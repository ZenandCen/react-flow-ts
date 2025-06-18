import React, { useState, useEffect, useCallback } from 'react';
import { Toggle } from '../ui/Toggle';
import { NumericInput } from '../ui/NumericInput';

interface FlowSettingsProps {
    panOnDrag: boolean;
    panOnScroll: boolean;
    zoomOnPinch: boolean;
    zoomOnDoubleClick: boolean;
    zoomOnScroll: boolean;
    fitViewPadding: number;
    fitViewMinZoom: number;
    fitViewMaxZoom: number;
    
    onSettingsChange: (settings: {
        panOnDrag?: boolean;
        panOnScroll?: boolean;
        zoomOnPinch?: boolean;
        zoomOnDoubleClick?: boolean;
        zoomOnScroll?: boolean;
        fitViewPadding?: number;
        fitViewMinZoom?: number;
        fitViewMaxZoom?: number;
    }) => void;
    isFlowLocked: boolean;
}


const FlowSettings: React.FC<FlowSettingsProps> = ({
    panOnDrag,
    panOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    zoomOnScroll,
    fitViewPadding,
    fitViewMinZoom,
    fitViewMaxZoom,
    onSettingsChange,
    isFlowLocked,
}) => {
    const [currentPanOnDrag, setCurrentPanOnDrag] = useState(panOnDrag);
    const [currentPanOnScroll, setCurrentPanOnScroll] = useState(panOnScroll);
    const [currentZoomOnPinch, setCurrentZoomOnPinch] = useState(zoomOnPinch);
    const [currentZoomOnDoubleClick, setCurrentZoomOnDoubleClick] = useState(zoomOnDoubleClick);
    const [currentZoomOnScroll, setCurrentZoomOnScroll] = useState(zoomOnScroll);
    const [currentFitViewPadding, setCurrentFitViewPadding] = useState(fitViewPadding);
    const [currentFitViewMinZoom, setCurrentFitViewMinZoom] = useState(fitViewMinZoom);
    const [currentFitViewMaxZoom, setCurrentFitViewMaxZoom] = useState(fitViewMaxZoom);

    useEffect(() => {
        setCurrentPanOnDrag(panOnDrag);
        setCurrentPanOnScroll(panOnScroll);
        setCurrentZoomOnPinch(zoomOnPinch);
        setCurrentZoomOnDoubleClick(zoomOnDoubleClick);
        setCurrentZoomOnScroll(zoomOnScroll);
        setCurrentFitViewPadding(fitViewPadding);
        setCurrentFitViewMinZoom(fitViewMinZoom);
        setCurrentFitViewMaxZoom(fitViewMaxZoom);
    }, [panOnDrag, panOnScroll, zoomOnPinch, zoomOnDoubleClick, zoomOnScroll, fitViewPadding, fitViewMinZoom, fitViewMaxZoom]);

    const handleChange = useCallback((key: string, value: any) => {
        onSettingsChange({ [key]: value });
    }, [onSettingsChange]);

    return (
        <div style={{ padding: '15px', borderTop: '1px solid #e0e0e0', marginTop: '15px' }}>
            <h4>⚙️ Flow Settings</h4>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Pan on Drag:
                    <Toggle 
                        checked={currentPanOnDrag} 
                        onChange={(checked) => { 
                            setCurrentPanOnDrag(checked); 
                            handleChange('panOnDrag', checked); 
                        }} 
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Pan on Scroll:
                    <Toggle 
                        checked={currentPanOnScroll} 
                        onChange={(checked) => { 
                            setCurrentPanOnScroll(checked); 
                            handleChange('panOnScroll', checked); 
                        }} 
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Zoom on Pinch:
                    <Toggle 
                        checked={currentZoomOnPinch} 
                        onChange={(checked) => { 
                            setCurrentZoomOnPinch(checked); 
                            handleChange('zoomOnPinch', checked); 
                        }} 
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Zoom on Double Click:
                    <Toggle 
                        checked={currentZoomOnDoubleClick} 
                        onChange={(checked) => { 
                            setCurrentZoomOnDoubleClick(checked); 
                            handleChange('zoomOnDoubleClick', checked); 
                        }} 
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Zoom on Scroll:
                    <Toggle 
                        checked={currentZoomOnScroll} 
                        onChange={(checked) => { 
                            setCurrentZoomOnScroll(checked); 
                            handleChange('zoomOnScroll', checked); 
                        }} 
                        disabled={isFlowLocked}
                    />
                </label>
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Fit View Options</h5>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Padding:
                    <NumericInput 
                        value={currentFitViewPadding} 
                        onChange={(val) => {
                            setCurrentFitViewPadding(val);
                            handleChange('fitViewPadding', val);
                        }} 
                        min={0} max={1} step={0.05}
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Min Zoom:
                    <NumericInput 
                        value={currentFitViewMinZoom} 
                        onChange={(val) => {
                            setCurrentFitViewMinZoom(val);
                            handleChange('fitViewMinZoom', val);
                        }} 
                        min={0.1} max={1} step={0.1}
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    Max Zoom:
                    <NumericInput 
                        value={currentFitViewMaxZoom} 
                        onChange={(val) => {
                            setCurrentFitViewMaxZoom(val);
                            handleChange('fitViewMaxZoom', val);
                        }} 
                        min={1} max={5} step={0.5}
                        disabled={isFlowLocked}
                    />
                </label>
            </div>
        </div>
    );
};

export default FlowSettings;
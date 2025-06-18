import React from 'react';
import { useDrag } from 'react-dnd';
import './css/Sidebar.css';
import FlowSettings from '../settings/FlowSettings';

interface SidebarProps {
  isFlowLocked: boolean;
  isSidebarOpen: boolean;
  // toggleSidebar: () => void;
  repeatCount: number;
  isLoopActive: boolean;

  // Props mới cho FlowSettings
  flowSettings: {
    panOnDrag: boolean;
    panOnScroll: boolean;
    zoomOnPinch: boolean;
    zoomOnDoubleClick: boolean;
    zoomOnScroll: boolean;
    fitViewPadding: number;
    fitViewMinZoom: number;
    fitViewMaxZoom: number;
  };
  onFlowSettingsChange: (settings: any) => void;
}

interface SidebarItemData {
  type: string;
  label: string;
  color?: string;
  isDisabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemData> = ({ type, label, color, isDisabled }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'node',
    item: { type },
    canDrag: !isDisabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [type, label, color, isDisabled]);

  drag(ref);

  const opacity = isDisabled ? 0.5 : 1;
  const cursor = isDisabled ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab');
  const boxShadow = isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)';
  const itemClasses = `sidebar-item ${isDisabled ? 'disabled' : ''} ${isDragging ? 'is-dragging' : ''}`;

  return (
    <div ref={ref}
      className={itemClasses}
      style={{
        padding: '8px 12px',
        border: '1px solid #ddd',
        marginBottom: 10,
        textAlign: 'center',
        borderRadius: 4,
        background: color || '#f9f9f9',
        opacity: opacity,
        cursor: cursor,
        boxShadow: boxShadow,
        transition: 'all 0.2s ease-in-out',
      }}>
      {label}
    </div>
  );
};

const sidebarItems: SidebarItemData[] = [
  { type: 'triggerNode', label: '⚡ Trigger' },
  { type: 'scheduleNode', label: '🕒 Schedule' },
  // { type: 'customTextNode', label: '📝 Text Input' },
  { type: 'customNumberNode', label: '🔢 Number Input' },
  { type: 'calculatorNode', label: '🧮 Calculator' },
  // { type: 'ifElseNode', label: '🔀 If/Else' },
  { type: 'httpRequestNode', label: '🌐 HTTP Request' },
  { type: 'weatherNode', label: '☁️ Weather' },
];

const Sidebar: React.FC<SidebarProps> = ({
  isFlowLocked,
  isSidebarOpen,
  // toggleSidebar,
  repeatCount,
  isLoopActive,
  flowSettings,
  onFlowSettingsChange,
}) => {
  const sidebarClasses = `sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`;

  return (
    <aside className={sidebarClasses}>
      {isSidebarOpen && (
        <>
          <h3>Nodes</h3>
          <div className="sidebar-items-wrapper">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.type}
                type={item.type}
                label={item.label}
                color={item.color}
                isDisabled={isFlowLocked}
              />
            ))}
          </div>

          <FlowSettings
            {...flowSettings}
            onSettingsChange={onFlowSettingsChange}
            isFlowLocked={isFlowLocked}
          />
        </>
      )}
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import "./styles/Drawer.css";

export enum DrawerDirection {
  Left = 'Left',
  Right = 'Right',
}

interface Node {
  id: string;
  name?: string;
  children?: Node[];
}

type Props = {
  isOpen: boolean;
  children: React.ReactNode;
  direction?: DrawerDirection;
  onClose: () => void;
};

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({checked, onChange, label = "Auto Calculate Timing?"}) => {
  return (
    <label style={{display: "flex", alignItems: "center", cursor: "pointer" }}>
      <input
        type = "checkbox"
        checked = {checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: "8px"}}/>
      {label}
      </label>
    );
};

function populateChildren(node: Node, children: Node[]): void {
  if (!node.children) {
      node.children = [];
  }
  node.children.push(...children);
  children.forEach(child => {
      populateChildren(child, child.children || []); 
  });
}

export const NozzleDrawer = ({
  isOpen,
  children,
  direction = DrawerDirection.Left,
  onClose,
}: Props) => {
  const classNames = `Drawer ${direction} ${
    isOpen ? 'Open' : ''
  }`;

  return (
    <aside
    role="dialog"
    aria-labelledby="nozzle-drawer-title"
    aria-hidden={!isOpen}>
      <div className={classNames}>
        <h2 id="nozzle-drawer-title">Nozzle Settings</h2>
      <div className='Close' onClick={onClose} aria-label="Close Nozzle Drawer">
        X
      </div>

        <div className = 'scrollable-container'>
          <div className ='Content'>
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
};

export const LineDrawer = ({
  isOpen,
  children,
  direction = DrawerDirection.Left,
  onClose,
}: Props) => {
  const classNames = `Drawer ${direction} ${
    isOpen ? 'Open' : ''
  }`;

  return (
    <aside
    role="dialog"
    aria-labelledby="nozzle-drawer-title"
    aria-hidden={!isOpen}>
    <div className={classNames}>
      <h2 id="line-drawer-title">Line Settings</h2>
      <div className='Close' onClick={onClose} aria-label="Close Line Drawer">
        X
      </div>

        <div className = 'scrollable-container'>
          <div className ='Content'>
            {children}
            </div>
        </div>
    </div>
    </aside>
  );
};

export const ControllerDrawer = ({
  isOpen,
  children,
  direction = DrawerDirection.Left,
  onClose
}: Props) => {
  const classNames = `Drawer ${direction} ${
    isOpen ? 'Open' : ''
  }`;
  const autoCalculateTiming =({
    
  })
  const [isChecked, setIsChecked] = React.useState(false);

  return (
    <aside
    role="dialog"
    aria-labelledby="controller-drawer-title"
    aria-hidden={!isOpen}>
    <div className={classNames}>
      <h2 id="controller-drawer-title">Controller Settings<Checkbox checked = {isChecked} onChange={setIsChecked}/>
      </h2>
      <div className='Close' onClick={onClose} aria-label="Close Line Drawer">
        X
      </div>
        <div style ={{padding: "20px"}}>
        </div>
        <div className = 'scrollable-container'>
          <div className ='Content'>
            {children}
            </div>
        </div>
    </div>
    </aside>
  );
};
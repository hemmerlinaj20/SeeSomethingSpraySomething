import { useEffect, useRef, useState } from 'react';
import React from 'react';
import "./styles/Drawer.css";
import autoCalculateTiming from "./App.tsx";


export enum DrawerDirection {
  Left = 'Left',
  Right = 'Right',
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
    <label style={{display: "flex", alignItems: "center", cursor: "pointer" }} id="autoTiming">
      <input
        type = "checkbox"
        checked = {checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginRight: "8px"}}/>
      {label}
      </label>
    );
};

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

  return (
    <aside
    role="dialog"
    aria-labelledby="controller-drawer-title"
    aria-hidden={!isOpen}>
    <div className={classNames}>
      <h2 id="controller-drawer-title">Controller Settings
      </h2>
      <div className='Close' onClick={onClose} aria-label="Close Line Drawer">
        X
      </div>
        <div style ={{padding: "0px"}}>
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

//function getTextWidth(text, font) {
//  const canvas = document.createElement('canvas');
//  const context = canvas.getContext('2d');
//
//  context.font = font || getComputedStyle(document.body).font;
//
//  return context.measureText(text).width;
//}
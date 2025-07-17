import React from 'react';
import './slidebar.css';

export default function Sidebar({ open, onClose, onSelect, selected, onLogout }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      <div className="sidebar-links">
        <button onClick={() => onSelect('chat')} className={selected === 'chat' ? 'active' : ''}>Voice Chat</button>
        <button onClick={() => onSelect('marketplace')} className={selected === 'marketplace' ? 'active' : ''}>Marketplace</button>
        <button onClick={() => onSelect('paidproducts')} className={selected === 'paidproducts' ? 'active' : ''}>Paid Products</button>
        {/* Add more as needed */}
      </div>
      <button className="sidebar-logout-btn" onClick={onLogout}>Logout</button>
    </div>
  );
}

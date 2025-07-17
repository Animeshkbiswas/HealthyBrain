import React from 'react';

export default function Sidebar({ open, onClose, onSelect, selected }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      <div className="sidebar-links">
        <button onClick={() => onSelect('chat')} className={selected === 'chat' ? 'active' : ''}>Voice Chat</button>
        <button onClick={() => onSelect('marketplace')} className={selected === 'marketplace' ? 'active' : ''}>Marketplace</button>
        <button onClick={() => onSelect('paidproducts')} className={selected === 'paidproducts' ? 'active' : ''}>Paid Products</button>
        {/* Add more as needed */}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import styles from './Sidebar.module.css';

// Icon components (inline SVG)
const PresentationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const BibleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="18" y2="7" />
    <line x1="8" y1="12" x2="18" y2="12" />
    <line x1="8" y1="17" x2="18" y2="17" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed && <div style={{ flex: 1 }} />}
        <button
          className={styles.sidebarToggle}
          onClick={handleToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div
            className={`${styles.sidebarToggleIcon} ${
              collapsed ? styles.sidebarToggleIconCollapsed : ''
            }`}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </div>
        </button>
      </div>

      <div className={styles.sidebarContent}>
        <div className={styles.sidebarSection}>
          <SidebarItem
            icon={<PresentationIcon />}
            label="Apresentação"
            active={isActive('/presentation')}
            collapsed={collapsed}
            onClick={() => handleItemClick('/presentation')}
          />
          <SidebarItem
            icon={<BibleIcon />}
            label="Bíblia"
            active={isActive('/bible')}
            collapsed={collapsed}
            onClick={() => handleItemClick('/bible')}
          />
        </div>

        <div className={styles.sidebarSpacer} />

        <div className={styles.sidebarFooter}>
          <SidebarItem
            icon={<SettingsIcon />}
            label="Configurações"
            active={isActive('/settings')}
            collapsed={collapsed}
            onClick={() => handleItemClick('/settings')}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


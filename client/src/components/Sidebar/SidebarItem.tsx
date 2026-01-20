import React, { ReactNode } from 'react';
import styles from './Sidebar.module.css';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  collapsed,
  onClick,
}) => {
  return (
    <div
      className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ''}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <div className={styles.sidebarItemIcon}>{icon}</div>
      {!collapsed && <span className={styles.sidebarItemLabel}>{label}</span>}
      {active && <div className={styles.sidebarItemIndicator} />}
    </div>
  );
};

export default SidebarItem;

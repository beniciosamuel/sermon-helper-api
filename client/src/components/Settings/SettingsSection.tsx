import React, { ReactNode } from 'react';
import styles from '../../styles/SettingsPage.module.css';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
};

export default SettingsSection;

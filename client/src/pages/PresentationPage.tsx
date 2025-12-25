import React from 'react';
import styles from '../styles/PresentationPage.module.css';

const PresentationPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Apresentação</h1>
        <p className={styles.subtitle}>Gerenciamento de mídia e slides</p>
      </div>
    </div>
  );
};

export default PresentationPage;


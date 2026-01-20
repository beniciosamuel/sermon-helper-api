import React from 'react';
import styles from '../styles/BiblePresenter.module.css';

interface FooterControlsProps {
  onBlank: () => void;
  onBlack: () => void;
  onLogo: () => void;
  onBack: () => void;
  onForward: () => void;
  onLive: () => void;
  isLive: boolean;
}

const FooterControls: React.FC<FooterControlsProps> = ({
  onBlank,
  onBlack,
  onLogo,
  onBack,
  onForward,
  onLive,
  isLive,
}) => {
  return (
    <div className={styles.footer}>
      <button className={styles.footerButton} onClick={onBlank}>
        Em Branco
      </button>
      <button className={styles.footerButton} onClick={onBlack}>
        Preto
      </button>
      <button className={styles.footerButton} onClick={onLogo}>
        Logo
      </button>
      <button className={styles.footerButton} onClick={onBack}>
        Voltar
      </button>
      <button className={styles.footerButton} onClick={onForward}>
        Avançar
      </button>
      <button className={`${styles.footerButton} ${styles.footerButtonPrimary}`} onClick={onLive}>
        {isLive ? 'AO VIVO' : 'AO VIVO'}
      </button>
    </div>
  );
};

export default FooterControls;

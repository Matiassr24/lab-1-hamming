import { Lock, Unlock, Bug, ShieldCheck, Key } from 'lucide-react';
import styles from './MenuAcciones.module.css';

const MenuAcciones = ({ onSelect }) => {
  return (
    <div className={styles.contenedorMenu}>
      <h2 className={styles.titulo}>Menú de Opciones</h2>

      {/* SECCIÓN 1: PROTEGER */}
      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>1. Proteger Archivo</h3>
        <div className={styles.grupoBotones}>
          <button className={styles.boton} onClick={() => onSelect('PROTEGER_8')}>
            <Lock size={16} />
            <span>Bloque de 8 bits (.HA1)</span>
          </button>
          <button className={styles.boton} onClick={() => onSelect('PROTEGER_1024')}>
            <Lock size={16} />
            <span>Bloque de 1024 bits (.HA2)</span>
          </button>
          <button className={styles.boton} onClick={() => onSelect('PROTEGER_16384')}>
            <Lock size={16} />
            <span>Bloque de 16384 bits (.HA3)</span>
          </button>
        </div>
      </div>

      <hr className={styles.divisor} />

      {/* SECCIÓN 2: ERRORES */}
      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>2. Simular Ruido</h3>
        <button
          className={`${styles.boton} ${styles.botonAlerta}`}
          onClick={() => onSelect('INTRODUCIR_ERROR')}
        >
          <Bug size={16} />
          <span>Introducir Errores (.HEx)</span>
        </button>
      </div>

      <hr className={styles.divisor} />

      {/* SECCIÓN 3: DESPROTEGER */}
      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>3. Desproteger Archivo</h3>
        <div className={styles.grupoBotones}>
          <button className={styles.boton} onClick={() => onSelect('DESPROTEGER_SIN_CORREGIR')}>
            <Unlock size={16} />
            <span>Sin Corregir (.DEx)</span>
          </button>
          <button className={`${styles.boton} ${styles.botonExito}`} onClick={() => onSelect('DESPROTEGER_CORRIGIENDO')}>
            <ShieldCheck size={16} />
            <span>Corrigiendo Errores (.DCx)</span>
          </button>
        </div>
      </div>

      <hr className={styles.divisor} />

      {/* SECCIÓN 4: EXTRAS */}
      <div className={styles.seccion}>
        <h3 className={styles.subtitulo}>4. Seguridad Extra</h3>
        <button className={styles.boton} onClick={() => onSelect('ENCRIPTAR')}>
          <Key size={16} />
          <span>Encriptar (Día y Hora)</span>
        </button>
      </div>

    </div>
  );
};

export default MenuAcciones;
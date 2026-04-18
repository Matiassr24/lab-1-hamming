import { useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import styles from './CargadorArchivos.module.css';

const CargadorArchivos = ({ onFileDrop }) => {
  const inputRef = useRef(null);

  const manejarCambioArchivo = (evento) => {
    const archivoSeleccionado = evento.target.files[0];
    if (archivoSeleccionado && archivoSeleccionado.name.endsWith('.txt')) {
      onFileDrop(archivoSeleccionado);
    } else {
      alert("Por favor, subí un archivo de texto (.txt)");
    }
  };

  return (
    <div className={styles.contenedorCargador}>
      <h2 className={styles.titulo}>Archivo de Trabajo</h2>

      <div
        className={styles.areaSubida}
        onClick={() => inputRef.current.click()}
      >
        <CloudUpload className={styles.iconoNube} />
        <p className={styles.textoSubida}>
          Haz clic aquí para seleccionar tu archivo .txt
        </p>
        <input
          type="file"
          accept=".txt"
          ref={inputRef}
          onChange={manejarCambioArchivo}
          className={styles.inputOculto}
        />
      </div>
    </div>
  );
};

export default CargadorArchivos;
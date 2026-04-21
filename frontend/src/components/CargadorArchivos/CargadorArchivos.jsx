import { useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import styles from './CargadorArchivos.module.css';

const CargadorArchivos = ({ onFileDrop }) => {
  const inputRef = useRef(null);

  // 1. Definimos las extensiones que tu laboratorio va a manejar
  const extensionesPermitidas = [
    '.txt', 
    '.HA1', '.HA2', '.HA3', 
    '.HE1', '.HE2', '.HE3', 
    '.DE1', '.DE2', '.DE3', 
    '.DC1', '.DC2', '.DC3'
  ];

  const manejarCambioArchivo = (evento) => {
    const archivoSeleccionado = evento.target.files[0];
    
    if (archivoSeleccionado) {
      const nombre = archivoSeleccionado.name;
      // 2. Verificamos si el archivo termina en alguna de nuestras extensiones
      const esValido = extensionesPermitidas.some(ext => nombre.endsWith(ext));

      if (esValido) {
        onFileDrop(archivoSeleccionado);
      } else {
        alert("Archivo no permitido. Usá .txt o variables de Hamming (.HAx, .HEx, .DEx, .DCx)");
      }
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
          Haz clic aquí para seleccionar tu archivo (.txt, .HA1, etc.)
        </p>
        {/* 3. Actualizamos el atributo accept para que el buscador de Windows los muestre */}
        <input
          type="file" 
          accept=".txt,.HA1,.HA2,.HA3,.HE1,.HE2,.HE3,.DE1,.DE2,.DE3,.DC1,.DC2,.DC3"
          ref={inputRef}
          onChange={manejarCambioArchivo}
          className={styles.inputOculto}
        />
      </div>
    </div>
  );
};

export default CargadorArchivos;
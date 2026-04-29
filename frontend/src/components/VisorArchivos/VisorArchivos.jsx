import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import styles from './VisorArchivos.module.css';

const VisorArchivos = ({ archivo, accion, resultadoProcesado }) => {
  const [contenidoOriginal, setContenidoOriginal] = useState('');

  // 1. Leer el archivo cuando se sube (Siempre como Texto/ASCII)
  useEffect(() => {
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        const texto = evento.target.result;
        setContenidoOriginal(texto);
      };
      
      const esBinario = archivo.name.match(/\.(HA|HE)\d$/i);
      lector.readAsText(archivo, esBinario ? 'utf-16le' : 'utf-8');
    }
  }, [archivo]);

  if (!archivo) {
    return (
      <div className={styles.contenedorVacio}>
        <p>Subí un archivo .txt para comenzar a trabajar.</p>
      </div>
    );
  }

  const renderConErrores = () => {
    if (!contenidoOriginal || !resultadoProcesado) return resultadoProcesado;
    
    if (accion && !accion.startsWith('INTRODUCIR_ERROR')) {
      return resultadoProcesado;
    }

    const output = [];
    const minLength = Math.min(contenidoOriginal.length, resultadoProcesado.length);

    for (let i = 0; i < resultadoProcesado.length; i++) {
      const charOriginal = contenidoOriginal[i];
      const charProcesado = resultadoProcesado[i];

      if (i < minLength && charOriginal !== charProcesado) {
        output.push(
          <span key={i} className={styles.letraError}>
            {charProcesado}
          </span>
        );
      } else {
        output.push(charProcesado);
      }
    }

    return output;
  };

  return (
    <div className={styles.contenedorVisor}>
      <div className={styles.cabecera}>
        <div className={styles.tituloWrapper}>
          <FileText className={styles.iconoTitulo} />
          <h2 className={styles.titulo}>Visor de Textos</h2>
        </div>
        <span className={styles.etiquetaArchivo}>Archivo: {archivo.name}</span>
      </div>

      <div className={styles.contenedorDoble}>
        {/* Panel Izquierdo: Original */}
        <div className={styles.panel}>
          <h3 className={styles.subtitulo}>Texto Original</h3>
          <div className={styles.areaTexto}>
            {contenidoOriginal}
          </div>
        </div>

        {/* Panel Derecho: Procesado */}
        <div className={styles.panel}>
          <h3 className={styles.subtitulo}>
            {accion ? `Resultado: ${accion.replace(/_/g, ' ')}` : 'Resultado Procesado'}
          </h3>
          <div className={styles.areaTexto}>
            {renderConErrores() || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisorArchivos;
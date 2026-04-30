import { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';
import styles from './VisorArchivos.module.css';

const VisorArchivos = ({ archivo, accion, resultadoProcesado, referenciaManual, nombreReferencia }) => {
  const [contenidoTrabajoOriginal, setContenidoTrabajoOriginal] = useState('');
  const [vistaIzquierda, setVistaIzquierda] = useState('referencia'); // 'referencia' o 'trabajo'
  const panelOriginalRef = useRef(null);
  const panelProcesadoRef = useRef(null);

  const sincronizarScroll = (e, targetRef) => {
    if (targetRef.current) {
      targetRef.current.scrollTop = e.target.scrollTop;
    }
  };

  useEffect(() => {
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        setContenidoTrabajoOriginal(evento.target.result);
      };
      const esBinario = archivo.name.match(/\.(HA|HE)\d$/i);
      lector.readAsText(archivo, esBinario ? 'utf-16le' : 'utf-8');
    }
  }, [archivo]);

  // Si no hay referencia manual, forzamos la vista a 'trabajo'
  useEffect(() => {
    if (!referenciaManual) {
      setVistaIzquierda('trabajo');
    } else {
      setVistaIzquierda('referencia');
    }
  }, [referenciaManual]);

  if (!archivo) {
    return (
      <div className={styles.contenedorVacio}>
        <p>Seleccioná un <b>Archivo de Trabajo</b> para ver su contenido aquí.</p>
      </div>
    );
  }

  const obtenerContenidoIzquierdo = () => {
    return vistaIzquierda === 'referencia' ? (referenciaManual || '') : contenidoTrabajoOriginal;
  };

  const renderConErrores = () => {
    if (!resultadoProcesado) return '';
    
    const baseParaComparar = obtenerContenidoIzquierdo();
    if (!baseParaComparar) return resultadoProcesado;

    const output = [];
    const minLength = Math.min(baseParaComparar.length, resultadoProcesado.length);

    for (let i = 0; i < resultadoProcesado.length; i++) {
      const charOriginal = baseParaComparar[i];
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
          <h2 className={styles.titulo}>Visor Comparativo</h2>
        </div>
        <div className={styles.metadatos}>
          <span className={styles.etiquetaArchivo}>Trabajo: <b>{archivo.name}</b></span>
          {nombreReferencia && (
            <span className={styles.etiquetaReferencia}>Referencia: <b>{nombreReferencia}</b></span>
          )}
        </div>
      </div>

      <div className={styles.contenedorDoble}>
        {/* Panel Izquierdo: Entrada / Referencia */}
        <div className={styles.panel}>
          <div className={styles.selectorPestañas}>
            <button 
              className={`${styles.pestaña} ${vistaIzquierda === 'referencia' ? styles.pestañaActiva : ''}`}
              onClick={() => setVistaIzquierda('referencia')}
              disabled={!referenciaManual}
            >
              Referencia
            </button>
            <button 
              className={`${styles.pestaña} ${vistaIzquierda === 'trabajo' ? styles.pestañaActiva : ''}`}
              onClick={() => setVistaIzquierda('trabajo')}
            >
              Archivo Trabajo
            </button>
          </div>
          
          <div 
            ref={panelOriginalRef} 
            className={styles.areaTexto}
            onScroll={(e) => sincronizarScroll(e, panelProcesadoRef)}
          >
            {obtenerContenidoIzquierdo()}
          </div>
        </div>

        {/* Panel Derecho: Salida */}
        <div className={styles.panel}>
          <h3 className={styles.subtituloResultado}>
            {accion ? `Resultado: ${accion.replace(/_/g, ' ')}` : 'Resultado Procesado'}
          </h3>
          <div 
            ref={panelProcesadoRef} 
            className={styles.areaTexto}
            onScroll={(e) => sincronizarScroll(e, panelOriginalRef)}
          >
            {renderConErrores()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisorArchivos;
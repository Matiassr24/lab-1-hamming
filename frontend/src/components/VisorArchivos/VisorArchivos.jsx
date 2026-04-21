import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import styles from './VisorArchivos.module.css';

const VisorArchivos = ({ archivo, accion }) => {
  const [contenidoOriginal, setContenidoOriginal] = useState('');
  const [contenidoProcesado, setContenidoProcesado] = useState('');
  const [posicionesError, setPosicionesError] = useState([]);

  // 1. Leer el archivo cuando se sube (Siempre como Texto/ASCII)
  useEffect(() => {
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        const texto = evento.target.result;
        setContenidoOriginal(texto);
        setContenidoProcesado(''); // Reseteamos el panel derecho
      };
      lector.readAsText(archivo, 'utf-8');
    }
  }, [archivo]);

  // 2. Escuchar la acción del menú (por ahora sin falsa simulación)
  useEffect(() => {
     // Si toca un botón, simplemente mantenemos el procesado igual al original
     // ya que el backend se encarga de descargar el archivo real.
     setContenidoProcesado(contenidoOriginal);
  }, [accion, contenidoOriginal]);

  if (!archivo) {
    return (
      <div className={styles.contenedorVacio}>
        <p>Subí un archivo .txt para comenzar a trabajar.</p>
      </div>
    );
  }

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

        {/* Panel Derecho: Explicación Educativa */}
        <div className={styles.panel}>
          <h3 className={styles.subtitulo}>
            {accion ? `Acción actual: ${accion.replace('_', ' ')}` : 'Consola de Análisis'}
          </h3>
          <div className={styles.areaTexto} style={{ color: '#aaa', fontStyle: 'italic' }}>
            {!accion && "Sube un archivo y elige una acción del menú para procesarlo vía Backend."}
            {accion && accion.startsWith('PROTEGER') && "El Backend procesará tu texto dividiéndolo en la cantidad de bits seleccionada, calculará las ecuaciones de paridad de Hamming y te descargará un binario con bits de redundancia intercalados."}
            {accion && accion.startsWith('INTRODUCIR_ERROR') && "El Backend analizará el tamaño de bloque usado e invertirá el estado (XOR 1) de un bit aleatorio simulando ruido temporal de transmisión. Notarás diferencias hexadecimales de 1 bit si comparas ambos archivos."}
            {accion && accion.startsWith('DESPROTEGER_SIN') && "Intentando decodificar el archivo asumiendo que es perfecto. Si hay errores ocultos, los bits de datos estarán rotos y verás caracteres de texto extraños."}
            {accion && accion.startsWith('DESPROTEGER_CORRIGIENDO') && "El Backend pasará cada bloque por el algoritmo de Síndrome. Detectará qué paridad no cierra, ubicará numéricamente en base-2 el bit corrupto, lo invertirá para sanarlo y luego removerá toda la paridad para entregarte el texto puro."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisorArchivos;
import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import styles from './VisorArchivos.module.css';

const VisorArchivos = ({ archivo, accion }) => {
  const [contenidoOriginal, setContenidoOriginal] = useState('');
  const [contenidoProcesado, setContenidoProcesado] = useState('');
  const [posicionesError, setPosicionesError] = useState([]);

  // 1. Leer el archivo cuando se sube
  useEffect(() => {
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (evento) => {
        const texto = evento.target.result;
        setContenidoOriginal(texto);
        setContenidoProcesado(texto);
        setPosicionesError([]);
      };
      lector.readAsText(archivo);
    }
  }, [archivo]);

  // 2. Escuchar la acción del menú para simular los errores
  useEffect(() => {
    if (accion === 'INTRODUCIR_ERROR' && contenidoOriginal) {
      simularErrores(contenidoOriginal);
    } else {
      // Si toca otro botón, por ahora volvemos a mostrar el texto normal
      setContenidoProcesado(contenidoOriginal);
      setPosicionesError([]);
    }
  }, [accion, contenidoOriginal]);

  const simularErrores = (texto) => {
    if (!texto) return;

    // Simulamos 5 errores al azar
    const cantidadErrores = Math.min(5, texto.length);
    const posiciones = new Set();

    // Buscamos posiciones aleatorias (evitando espacios y saltos de línea para que se note)
    while (posiciones.size < cantidadErrores) {
      const indiceRandom = Math.floor(Math.random() * texto.length);
      const caracter = texto[indiceRandom];
      if (caracter !== ' ' && caracter !== '\n' && caracter !== '\r') {
        posiciones.add(indiceRandom);
      }
    }

    const arrayPosiciones = Array.from(posiciones);
    let textoAlterado = texto.split('');

    // Cambiamos la letra original por un caracter "corrupto" (ej: )
    arrayPosiciones.forEach(indice => {
      textoAlterado[indice] = '';
    });

    setPosicionesError(arrayPosiciones);
    setContenidoProcesado(textoAlterado.join(''));
  };

  // 3. Función clave: Dibuja el texto e inyecta el <span> rojo en los errores
  const renderizarTextoConErrores = () => {
    if (posicionesError.length === 0) return contenidoProcesado;

    return contenidoProcesado.split('').map((letra, indice) => {
      if (posicionesError.includes(indice)) {
        // Si el índice actual tiene error, lo pintamos
        return <span key={indice} className={styles.letraError}>{letra}</span>;
      }
      return letra; // Si no, devolvemos la letra normal
    });
  };

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

        {/* Panel Derecho: Modificado */}
        <div className={styles.panel}>
          <h3 className={styles.subtitulo}>
            {accion ? `Resultado: ${accion}` : 'Texto Procesado'}
          </h3>
          <div className={styles.areaTexto}>
            {/* Llamamos a la función que pinta los errores */}
            {renderizarTextoConErrores()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisorArchivos;
import { useState } from 'react';
import CargadorArchivos from './components/CargadorArchivos/CargadorArchivos';
import MenuAcciones from './components/MenuAcciones/MenuAcciones';
import VisorArchivos from './components/VisorArchivos/VisorArchivos';

function App() {
  const [archivoReferencia, setArchivoReferencia] = useState(null);
  const [archivoTrabajo, setArchivoTrabajo] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [contenidoProcesado, setContenidoProcesado] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  const [refText, setRefText] = useState('');

  const enviarAlBackend = async (archivoSeleccionado, accionSeleccionada) => {
    if (!archivoSeleccionado) {
      alert("Por favor, subí primero un Archivo de Trabajo.");
      return;
    }

    console.log("🚀 Iniciando petición al backend:", { archivo: archivoSeleccionado.name, accion: accionSeleccionada });
    setProcesando(true);
    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('accion', accionSeleccionada);

    try {
      const respuesta = await fetch('/api/hamming/procesar', {
        method: 'POST',
        body: formData,
      });

      if (respuesta.ok) {
        console.log("✅ Respuesta exitosa del servidor");
        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        let extension = ".txt";
        let baseName = archivoSeleccionado.name.substring(0, archivoSeleccionado.name.lastIndexOf('.')) || archivoSeleccionado.name;
        let oldExt = archivoSeleccionado.name.substring(archivoSeleccionado.name.lastIndexOf('.') + 1).toUpperCase();
        
        let x = "1";
        if (oldExt.endsWith("2") || accionSeleccionada.includes("1024")) x = "2";
        if (oldExt.endsWith("3") || accionSeleccionada.includes("16384")) x = "3";

        switch (accionSeleccionada) {
            case "PROTEGER_8": extension = ".HA1"; break;
            case "PROTEGER_1024": extension = ".HA2"; break;
            case "PROTEGER_16384": extension = ".HA3"; break;
            case "INTRODUCIR_ERROR": extension = ".HE" + x; break;
            case "DESPROTEGER_SIN_CORREGIR": extension = ".DE" + x; break;
            case "DESPROTEGER_CORRIGIENDO": extension = ".DC" + x; break;
            case "ENCRIPTAR": extension = ".ENC"; break;
            default: extension = ".txt";
        }

        link.download = baseName + extension;
        link.click();

        const esArchivoBinario = accionSeleccionada.startsWith('PROTEGER') || accionSeleccionada.startsWith('INTRODUCIR_ERROR');
        if (esArchivoBinario) {
          const arrayBuffer = await blob.arrayBuffer();
          const decoder = new TextDecoder('utf-16le');
          setContenidoProcesado(decoder.decode(arrayBuffer));
        } else {
          setContenidoProcesado(await blob.text());
        }
      } else {
        console.error("❌ Error en el servidor:", respuesta.status);
        alert("El servidor devolvió un error (Código " + respuesta.status + "). Revisa el archivo subido.");
      }
    } catch (error) {
      console.error("❌ Error de red/conexión:", error);
      alert("No se pudo conectar con el servidor. ¿Está el .jar corriendo?");
    } finally {
      setProcesando(false);
    }
  };

  const handleRefFileDrop = async (file) => {
    setArchivoReferencia(file);
    const esBinario = file.name.match(/\.(HA|HE)\d$/i);
    try {
        if (esBinario) {
          const buf = await file.arrayBuffer();
          const decoder = new TextDecoder('utf-16le');
          setRefText(decoder.decode(buf));
        } else {
          setRefText(await file.text());
        }
    } catch (e) {
        console.error("Error leyendo archivo de referencia:", e);
    }
  };

  const handleWorkFileDrop = (file) => {
    console.log("📁 Archivo de trabajo cargado:", file.name);
    setArchivoTrabajo(file);
    setSelectedAction(null);
    setContenidoProcesado('');
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    enviarAlBackend(archivoTrabajo, action);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(20rem, 1fr) 2fr', gap: '1.5rem', padding: '1.5rem', height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
        
        <CargadorArchivos 
          titulo="1. Archivo de Referencia"
          subtitulo={archivoReferencia ? `✅ ${archivoReferencia.name}` : "Subí el original para comparar"}
          onFileDrop={handleRefFileDrop}
        />

        <CargadorArchivos 
          titulo="2. Archivo de Trabajo"
          subtitulo={archivoTrabajo ? `🛠️ ${archivoTrabajo.name}` : "Subí el archivo a procesar"}
          onFileDrop={handleWorkFileDrop}
        />

        {archivoTrabajo && (
          <div style={{ opacity: procesando ? 0.5 : 1, pointerEvents: procesando ? 'none' : 'auto' }}>
            <MenuAcciones onSelect={handleActionSelect} />
          </div>
        )}

        {procesando && (
            <div style={{ textAlign: 'center', color: '#3b82f6', fontWeight: 'bold', padding: '1rem', background: '#eff6ff', borderRadius: '0.5rem' }}>
                ⌛ Procesando archivo...
            </div>
        )}
      </aside>

      <main style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <VisorArchivos 
          archivo={archivoTrabajo} 
          accion={selectedAction} 
          resultadoProcesado={contenidoProcesado} 
          referenciaManual={refText}
          nombreReferencia={archivoReferencia?.name}
        />
      </main>
    </div>
  );
}

export default App;
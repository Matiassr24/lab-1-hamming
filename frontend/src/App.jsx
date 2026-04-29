import { useState } from 'react';
import CargadorArchivos from './components/CargadorArchivos/CargadorArchivos';
import MenuAcciones from './components/MenuAcciones/MenuAcciones';
import VisorArchivos from './components/VisorArchivos/VisorArchivos';

function App() {
  const [file, setFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [contenidoProcesado, setContenidoProcesado] = useState('');

  const formatHexDump = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let hexString = '';
    let asciiString = '';
    let result = '';
    const bytesPerLine = 16;

    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      hexString += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
      asciiString += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';

      if ((i + 1) % bytesPerLine === 0 || i === bytes.length - 1) {
        if ((i + 1) % bytesPerLine !== 0) {
          const padding = bytesPerLine - ((i + 1) % bytesPerLine);
          hexString += '   '.repeat(padding);
        }
        const offset = (Math.floor(i / bytesPerLine) * bytesPerLine).toString(16).padStart(8, '0').toUpperCase();
        result += `${offset}  ${hexString} |${asciiString}|\n`;
        hexString = '';
        asciiString = '';
      }
    }
    return result;
  };

  const enviarAlBackend = async (archivoSeleccionado, accionSeleccionada) => {
    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('accion', accionSeleccionada);

    try {
      const respuesta = await fetch('http://localhost:8081/api/hamming/procesar', {
        method: 'POST',
        body: formData,
      });

      if (respuesta.ok) {
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
            case "PROTEGER_8":
                extension = ".HA1";
                break;
            case "PROTEGER_1024":
                extension = ".HA2";
                break;
            case "PROTEGER_16384":
                extension = ".HA3";
                break;
            case "INTRODUCIR_ERROR":
                extension = ".HE" + x;
                break;
            case "DESPROTEGER_SIN_CORREGIR":
                extension = ".DE" + x;
                break;
            case "DESPROTEGER_CORRIGIENDO":
                extension = ".DC" + x;
                break;
            case "ENCRIPTAR":
                extension = ".ENC"; 
                break;
            default:
                extension = ".txt";
        }

        link.download = baseName + extension;
        link.click();
        console.log("Archivo descargado con éxito");

        const esArchivoBinario = accionSeleccionada.startsWith('PROTEGER') || accionSeleccionada.startsWith('INTRODUCIR_ERROR');
        if (esArchivoBinario) {
          const arrayBuffer = await blob.arrayBuffer();
          const decoder = new TextDecoder('utf-16le');
          const textoChino = decoder.decode(arrayBuffer);
          setContenidoProcesado(textoChino);
        } else {
          const texto = await blob.text();
          setContenidoProcesado(texto);
        }
      }
    } catch (error) {
      console.error("Error conectando al backend:", error);
    }
  };

  const handleFileDrop = (uploadedFile) => {
    setFile(uploadedFile);
    setSelectedAction(null);
    setContenidoProcesado('');
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    enviarAlBackend(file, action);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(20rem, 1fr) 2fr', gap: '1.5rem', padding: '1.5rem', height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
        <CargadorArchivos onFileDrop={handleFileDrop} />
        {file && <MenuAcciones onSelect={handleActionSelect} />}
      </aside>

      <main style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <VisorArchivos archivo={file} accion={selectedAction} resultadoProcesado={contenidoProcesado} />
      </main>
    </div>
  );
}

export default App;
import { useState } from 'react';
import CargadorArchivos from './components/CargadorArchivos/CargadorArchivos';
import MenuAcciones from './components/MenuAcciones/MenuAcciones';
import VisorArchivos from './components/VisorArchivos/VisorArchivos';

function App() {
  const [file, setFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  // 1. Definimos la función que se comunica con el backend (puerto 8081)
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
  
  // Determinamos el índice 'x' (1, 2 o 3)
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
          extension = ".ENC"; // A definir
          break;
      default:
          extension = ".txt";
  }

  link.download = baseName + extension;
  link.click();
      console.log("Archivo descargado con éxito");
    }
  } catch (error) {
    console.error("Error conectando al backend:", error);
  }
};

  const handleFileDrop = (uploadedFile) => {
    setFile(uploadedFile);
  };

  // 2. Conectamos la selección del menú con la función de envío
  const handleActionSelect = (action) => {
    setSelectedAction(action);
    // Disparamos el envío a Java pasándole el archivo actual y la acción que tocaste
    enviarAlBackend(file, action);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(20rem, 1fr) 2fr', gap: '1.5rem', padding: '1.5rem', height: '100vh', boxSizing: 'border-box', overflow: 'hidden' }}>
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
        <CargadorArchivos onFileDrop={handleFileDrop} />
        {file && <MenuAcciones onSelect={handleActionSelect} />}
      </aside>

      <main style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <VisorArchivos archivo={file} accion={selectedAction} />
      </main>
    </div>
  );
}

export default App;
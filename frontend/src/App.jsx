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

  // DINAMISMO AQUÍ:
  // Si la acción es INTRODUCIR_ERROR, le ponemos .HEx, si es PROTEGER_8 le ponemos .HA1
  let extension = ".txt";
  if (accionSeleccionada === "PROTEGER_8") extension = ".HA1";
  if (accionSeleccionada === "INTRODUCIR_ERROR") extension = "E.HA1";
  if (accionSeleccionada === "DESPROTEGER_8") extension = "_recuperado.txt";

  link.download =  archivoSeleccionado.name.split('.')[0] + extension;
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
import { useState } from 'react';
import CargadorArchivos from './components/CargadorArchivos/CargadorArchivos';
import MenuAcciones from './components/MenuAcciones/MenuAcciones';
import VisorArchivos from './components/VisorArchivos/VisorArchivos';

function App() {
  const [file, setFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  // 1. Definimos la función que se comunica con el backend (puerto 8081)
  const enviarAlBackend = async (archivoSeleccionado, accionSeleccionada) => {
    if (!archivoSeleccionado) return; // Por si acaso no hay archivo

    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('accion', accionSeleccionada);

    try {
      console.log("Enviando petición a Java...");
      const respuesta = await fetch('http://localhost:8081/api/hamming/procesar', {
        method: 'POST',
        body: formData,
      });

      if (respuesta.ok) {
        const textoRespuesta = await respuesta.text();
        console.log("ÉXITO:", textoRespuesta);
        // Tiramos una alerta en el navegador para que veas que llegó bien
        alert("Respuesta del Backend: " + textoRespuesta);
      } else {
        console.error("El backend tiró un error:", respuesta.status);
        alert("El servidor respondió con un error " + respuesta.status);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar. ¿Asegurate de que Java esté corriendo en el 8081?");
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
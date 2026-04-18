import { useState } from 'react';
import CargadorArchivos from './components/CargadorArchivos/CargadorArchivos';
import MenuAcciones from './components/MenuAcciones/MenuAcciones';
import VisorArchivos from './components/VisorArchivos/VisorArchivos';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleFileDrop = (uploadedFile) => {
    setFile(uploadedFile);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    // Más adelante, aquí llamaremos a la API de Java según la acción
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
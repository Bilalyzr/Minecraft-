import { Experience } from './core/Experience';
import { HUD } from './ui/HUD';
import { MinimapTeleport } from './ui/MinimapTeleport';
import { ProjectModal } from './ui/ProjectModal';
import { MobileControls } from './ui/MobileControls';
import { LoadingScreen } from './ui/LoadingScreen';

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#081018] select-none">
      <Experience />
      <HUD />
      <MinimapTeleport />
      <MobileControls />
      <ProjectModal />
      <LoadingScreen />
    </main>
  );
}

export default App;

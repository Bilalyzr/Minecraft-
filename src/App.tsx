import { Experience } from './core/Experience';
import { HUD } from './ui/HUD';
import { MinimapTeleport } from './ui/MinimapTeleport';
import { ProjectModal } from './ui/ProjectModal';
import { VisitorOnboardingModal } from './ui/VisitorOnboardingModal';
import { ProjectManagerModal } from './ui/ProjectManagerModal';
import { ResumeStoryModal } from './ui/ResumeStoryModal';
import { MobileControls } from './ui/MobileControls';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorBoundary } from './ui/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <main className="relative h-screen w-screen overflow-hidden bg-[#081018] select-none">
        <Experience />
        <HUD />
        <MinimapTeleport />
        <MobileControls />
        <ProjectModal />
        <VisitorOnboardingModal />
        <ProjectManagerModal />
        <ResumeStoryModal />
        <LoadingScreen />
      </main>
    </ErrorBoundary>
  );
}

export default App;

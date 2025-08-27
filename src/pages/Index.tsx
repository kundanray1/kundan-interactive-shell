import { useState, useEffect } from 'react';
import Terminal from '@/components/Terminal';
import VisualPane from '@/components/VisualPane';
import SectionTags from '@/components/SectionTags';

const Index = () => {
  const [activeSection, setActiveSection] = useState<string>('about');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return; // Don't interfere with terminal input
      
      const shortcuts: Record<string, string> = {
        '1': 'about',
        '2': 'skills', 
        '3': 'projects',
        '4': 'experience',
        '5': 'contact'
      };

      if (shortcuts[e.key]) {
        setActiveSection(shortcuts[e.key]);
      } else if (e.key === '?') {
        // Focus terminal and show help
        const terminalInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (terminalInput) {
          terminalInput.focus();
          terminalInput.value = 'help';
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Layout */}
      <div className="grid lg:grid-cols-2 h-screen">
        {/* Visual Pane - Left Side */}
        <div 
          className="order-2 lg:order-1 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/left_background.webp)' }}
        >
          <VisualPane 
            activeSection={activeSection}
            onSectionClick={handleSectionChange}
          />
        </div>

        {/* Terminal Pane - Right Side */}
        <div className="order-1 lg:order-2 flex flex-col h-screen">
          {/* Section Tags */}
          <SectionTags 
            activeSection={activeSection}
            onSectionClick={handleSectionChange}
          />
          
          {/* Terminal */}
          <div className="flex-1 p-4 min-h-0">
            <Terminal onSectionChange={handleSectionChange} />
          </div>
        </div>
      </div>

      {/* Mobile responsive styling is handled in Tailwind */}
    </div>
  );
};

export default Index;

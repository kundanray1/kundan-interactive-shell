import { useState } from 'react';

interface SectionTagsProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
  onCommandInsert?: (command: string) => void;
}

const SectionTags = ({ activeSection, onSectionClick, onCommandInsert }: SectionTagsProps) => {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const sections = [
    { id: 'about', label: 'about', shortcut: '1' },
    { id: 'skills', label: 'skills', shortcut: '2' },
    { id: 'projects', label: 'projects', shortcut: '3' },
    { id: 'experience', label: 'experience', shortcut: '4' },
    { id: 'contact', label: 'contact', shortcut: '5' }
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-visual-border">
      {sections.map((section, index) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredTag === section.id;
        
        const handleClick = (e: React.MouseEvent) => {
          // Regular click inserts command in terminal AND changes section
          onCommandInsert?.(`open ${section.id}`);
          onSectionClick?.(section.id);
        };

        return (
          <button
            key={section.id}
            onClick={handleClick}
            onMouseEnter={() => setHoveredTag(section.id)}
            onMouseLeave={() => setHoveredTag(null)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-mono transition-all duration-300 relative
              ${isActive 
                ? 'bg-accent-primary text-primary-foreground shadow-neumorphic' 
                : 'bg-visual-card text-terminal-text hover:bg-card-hover border border-visual-border'
              }
              animate-slide-up
            `}
            style={{ animationDelay: `${index * 50}ms` }}
            title={`Press ${section.shortcut} or click to insert command: open ${section.id}`}
          >
            <span className="relative z-10">{section.label}</span>
            
            {/* Shortcut indicator */}
            <span className={`
              absolute -top-1 -right-1 w-4 h-4 bg-terminal-chrome text-[10px] rounded-full 
              flex items-center justify-center font-bold transition-opacity duration-200
              ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
            `}>
              {section.shortcut}
            </span>
            
            {/* Glow effect for active */}
            {isActive && (
              <div className="absolute inset-0 bg-accent-primary rounded-full animate-glow-pulse opacity-30 -z-10" />
            )}
          </button>
        );
      })}
      
      {/* Help indicator */}
      <div className="ml-auto text-xs text-muted-foreground font-mono flex items-center">
        <span className="opacity-60">Press ? for help</span>
      </div>
    </div>
  );
};

export default SectionTags;
import { useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  onSectionClick?: (section: string) => void;
}

const AvatarModal = ({ isOpen, onClose, sections, onSectionClick }: AvatarModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSectionClick = (sectionId: string) => {
    onSectionClick?.(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-visual-card border border-visual-border rounded-lg shadow-terminal p-6 m-4 max-w-md w-full animate-spring-bounce">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Quick Navigation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* ID Cards Stack */}
        <div className="space-y-3">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            
            return (
              <Card
                key={section.id}
                className="p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-neumorphic bg-gradient-card border-visual-border animate-slide-up"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transform: `translateY(${index * -2}px) translateX(${index * 2}px)`
                }}
                onClick={() => handleSectionClick(section.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-visual-bg rounded-lg flex items-center justify-center">
                    <IconComponent size={20} className="text-accent-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="text-xs text-accent-primary font-mono bg-visual-bg px-2 py-1 rounded">
                    open {section.id}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-visual-border text-center">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Click any card to run the command in terminal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
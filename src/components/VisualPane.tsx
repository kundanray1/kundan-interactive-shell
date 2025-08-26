import { useState } from 'react';
import { User, Code, Briefcase, Mail, Wrench, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AvatarModal from './AvatarModal';

interface VisualPaneProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
}

const VisualPane = ({ activeSection, onSectionClick }: VisualPaneProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sections = [
    { id: 'about', title: 'About', icon: User, color: 'accent-primary', description: 'Who I am' },
    { id: 'skills', title: 'Skills', icon: Wrench, color: 'accent-secondary', description: 'What I know' },
    { id: 'projects', title: 'Projects', icon: Code, color: 'accent-tertiary', description: 'What I build' },
    { id: 'experience', title: 'Experience', icon: Briefcase, color: 'accent-primary', description: 'Where I worked' },
    { id: 'contact', title: 'Contact', icon: Mail, color: 'accent-secondary', description: 'Get in touch' }
  ];

  const badges = [
    'Open Source',
    'TypeScript Lover', 
    'React/Node',
    'UI/UX',
    'Terminal Geek'
  ];

  return (
    <div className="h-full bg-visual-bg p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-primary opacity-30" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent-primary/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent-secondary/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-accent-tertiary/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div 
            className="relative w-32 h-32 mx-auto mb-6 cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="w-full h-full bg-gradient-card rounded-full shadow-neumorphic flex items-center justify-center group-hover:shadow-terminal transition-all duration-300 group-hover:scale-105">
              <Coffee size={48} className="text-accent-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center shadow-card-custom animate-glow-pulse">
              <span className="text-xs font-bold text-primary-foreground">KR</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Kundan Ray</h1>
          <p className="text-lg text-muted-foreground mb-1">Senior Full-Stack Engineer</p>
          <p className="text-sm text-accent-primary">Playful UI × Interactive Terminal</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {badges.map((badge, index) => (
            <span
              key={badge}
              className="px-3 py-1 bg-visual-card border border-visual-border rounded-full text-xs font-medium text-accent-primary shadow-card-custom hover:shadow-neumorphic transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Section Cards */}
        <div className="flex-1 space-y-3">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Card
                key={section.id}
                className={`
                  p-4 cursor-pointer transition-all duration-300 transform
                  ${isActive 
                    ? 'shadow-terminal scale-105 bg-card-hover border-accent-primary' 
                    : 'shadow-neumorphic hover:shadow-terminal hover:scale-102 bg-visual-card border-visual-border'
                  }
                  animate-slide-up
                `}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => onSectionClick?.(section.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isActive ? 'bg-accent-primary text-primary-foreground' : 'bg-visual-bg'}
                  `}>
                    <IconComponent size={20} className={isActive ? '' : 'text-accent-primary'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground opacity-60">
                    open {section.id}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <Button 
            onClick={() => onSectionClick?.('contact')}
            className="bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground shadow-neumorphic hover:shadow-terminal transition-all duration-300"
          >
            Get In Touch
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Or try: <code className="text-accent-primary">contact</code> in terminal
          </p>
        </div>
      </div>

      {/* Avatar Modal */}
      <AvatarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        sections={sections}
        onSectionClick={onSectionClick}
      />
    </div>
  );
};

export default VisualPane;
import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Globe, Github, Linkedin, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HangingIDCardProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
}

const HangingIDCard = ({ activeSection, onSectionClick }: HangingIDCardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const container = cardRef.current.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Constrain to container bounds
    const maxX = containerRect.width - cardRect.width;
    const maxY = containerRect.height - cardRect.height;
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);

  const sections = [
    { id: 'about', title: 'About', icon: '👨‍💻' },
    { id: 'skills', title: 'Skills', icon: '🛠️' },
    { id: 'projects', title: 'Projects', icon: '🧩' },
    { id: 'experience', title: 'Experience', icon: '🏢' },
    { id: 'contact', title: 'Contact', icon: '✉️' }
  ];

  const handleCall = (type: 'phone' | 'email') => {
    if (type === 'phone') {
      window.open('tel:+977-9800000000');
    } else {
      window.open('mailto:hello@kundan.ray');
    }
  };

  return (
    <div className="h-full bg-visual-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-primary opacity-20" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent-secondary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Lanyard */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-40 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-accent-primary to-accent-secondary relative">
          {/* Repeating text on lanyard */}
          <div className="absolute inset-0 flex flex-col items-center justify-start text-[8px] font-mono text-primary-foreground/80 leading-tight pt-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="whitespace-nowrap transform rotate-90 mb-4">
                kundanray.com.np
              </div>
            ))}
          </div>
          
          {/* Lanyard clip */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-accent-tertiary rounded-sm" />
        </div>
      </div>

      {/* Hanging ID Card */}
      <div
        ref={cardRef}
        className={`absolute transition-transform duration-300 ${isDragging ? 'scale-105' : 'hover:scale-102'}`}
        style={{
          left: `calc(50% - 120px + ${position.x}px)`,
          top: `calc(140px + ${position.y}px)`,
          transform: `rotate(${position.x * 0.02}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Card Shadow */}
        <div className="absolute inset-0 bg-card-shadow rounded-lg blur-sm transform translate-y-2 opacity-30" />
        
        {/* Main Card */}
        <div className="relative w-60 h-80 bg-gradient-card border border-visual-border rounded-lg shadow-neumorphic overflow-hidden">
          {/* Card Header */}
          <div className="h-20 bg-accent-primary relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-secondary opacity-90" />
            <div className="absolute bottom-2 left-4 text-primary-foreground">
              <div className="text-xs font-mono opacity-80">EMPLOYEE ID</div>
              <div className="text-sm font-bold">#DEV-2024</div>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative -mt-8 flex justify-center">
            <div className="w-16 h-16 bg-visual-bg rounded-full border-4 border-background shadow-neumorphic flex items-center justify-center">
              <Coffee size={24} className="text-accent-primary" />
            </div>
          </div>

          {/* Card Content */}
          <div className="p-4 text-center">
            <h2 className="text-xl font-bold mb-1">Kundan Ray</h2>
            <p className="text-sm text-accent-primary mb-1">Senior Full-Stack Engineer</p>
            <p className="text-xs text-muted-foreground mb-4">Kathmandu, Nepal</p>

            {/* Quick Info */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex items-center justify-center space-x-1">
                <Globe size={12} className="text-accent-primary" />
                <span>kundanray.com.np</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <Mail size={12} className="text-accent-primary" />
                <span>hello@kundan.ray</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mb-4">
              <Button
                onClick={() => handleCall('phone')}
                className="flex-1 h-8 text-xs bg-accent-primary hover:bg-accent-primary/90 text-primary-foreground"
              >
                <Phone size={12} className="mr-1" />
                Call
              </Button>
              <Button
                onClick={() => handleCall('email')}
                className="flex-1 h-8 text-xs bg-accent-secondary hover:bg-accent-secondary/90 text-primary-foreground"
              >
                <Mail size={12} className="mr-1" />
                Email
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-3">
              <button className="p-2 bg-visual-bg rounded-full hover:bg-card-hover transition-colors">
                <Github size={14} className="text-accent-primary" />
              </button>
              <button className="p-2 bg-visual-bg rounded-full hover:bg-card-hover transition-colors">
                <Linkedin size={14} className="text-accent-primary" />
              </button>
              <button className="p-2 bg-visual-bg rounded-full hover:bg-card-hover transition-colors">
                <Globe size={14} className="text-accent-primary" />
              </button>
            </div>
          </div>

          {/* Card Footer */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-accent-primary/10 flex items-center justify-center">
            <div className="text-xs font-mono text-accent-primary">
              VALID UNTIL: ∞
            </div>
          </div>
        </div>
      </div>

      {/* Drag Instruction */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono opacity-60">
        🖱️ Drag the ID card around
      </div>

      {/* Bottom Navigation Tags */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="bg-visual-card/80 backdrop-blur-sm border border-visual-border rounded-lg p-4 shadow-neumorphic">
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-accent-primary">Navigation</h3>
            <p className="text-xs text-muted-foreground">Click to explore sections</p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionClick?.(section.id)}
                  className={`
                    px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 relative
                    ${isActive 
                      ? 'bg-accent-primary text-primary-foreground shadow-neumorphic transform scale-105' 
                      : 'bg-visual-bg text-foreground hover:bg-card-hover border border-visual-border hover:shadow-card-custom'
                    }
                    animate-slide-up
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="mr-1">{section.icon}</span>
                  {section.title}
                  
                  {/* Terminal command hint */}
                  <span className="absolute -top-1 -right-1 text-[8px] bg-terminal-chrome text-terminal-text px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground font-mono">
              Terminal: <code className="text-accent-primary">open {activeSection || 'about'}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HangingIDCard;
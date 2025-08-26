import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Globe, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import profilePhoto from '@/assets/profile-photo.jpg';

interface HangingIDCardProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
}

const HangingIDCard = ({ activeSection, onSectionClick }: HangingIDCardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lanyardStretch, setLanyardStretch] = useState(0);
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
    
    // Constrain to container bounds with more realistic movement
    const maxX = containerRect.width - cardRect.width;
    const maxY = containerRect.height - cardRect.height - 100; // Account for lanyard
    
    const constrainedX = Math.max(-50, Math.min(maxX + 50, newX));
    const constrainedY = Math.max(50, Math.min(maxY, newY));
    
    setPosition({
      x: constrainedX,
      y: constrainedY
    });

    // Calculate lanyard stretch based on distance from center
    const centerX = containerRect.width / 2;
    const distanceFromCenter = Math.abs(constrainedX + cardRect.width / 2 - centerX);
    const stretch = Math.min(distanceFromCenter * 0.3, 30);
    setLanyardStretch(stretch);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Gentle bounce back effect
    setTimeout(() => {
      setLanyardStretch(0);
    }, 200);
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

  const handleCall = (type: 'phone' | 'email' | 'website') => {
    if (type === 'phone') {
      window.open('tel:+977-9800000000');
    } else if (type === 'email') {
      window.open('mailto:hello@kundan.ray');
    } else {
      window.open('https://kundanray.com.np', '_blank');
    }
  };

  return (
    <div className="h-full bg-visual-bg relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-primary opacity-20" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent-secondary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Neck Straps - Two straps from top corners */}
      <div className="absolute top-0 left-0 right-0 h-60">
        {/* Left Strap */}
        <div 
          className="absolute top-0 left-1/4 w-4 bg-gradient-to-b from-accent-primary to-accent-secondary transform origin-top transition-transform duration-200"
          style={{
            height: `${160 + lanyardStretch}px`,
            transform: `translateX(${position.x * 0.3}px) rotate(${position.x * 0.05}deg)`
          }}
        >
          {/* Repeating text on left strap */}
          <div className="absolute inset-0 flex flex-col items-center justify-start text-[6px] font-mono text-primary-foreground/80 leading-tight pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="whitespace-nowrap transform rotate-90 mb-2">
                kundanray.com.np
              </div>
            ))}
          </div>
        </div>

        {/* Right Strap */}
        <div 
          className="absolute top-0 right-1/4 w-4 bg-gradient-to-b from-accent-primary to-accent-secondary transform origin-top transition-transform duration-200"
          style={{
            height: `${160 + lanyardStretch}px`,
            transform: `translateX(${-position.x * 0.3}px) rotate(${-position.x * 0.05}deg)`
          }}
        >
          {/* Repeating text on right strap */}
          <div className="absolute inset-0 flex flex-col items-center justify-start text-[6px] font-mono text-primary-foreground/80 leading-tight pt-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="whitespace-nowrap transform rotate-90 mb-2">
                kundanray.com.np
              </div>
            ))}
          </div>
        </div>

        {/* Connection point */}
        <div 
          className="absolute w-6 h-2 bg-accent-tertiary rounded-sm transition-all duration-200"
          style={{
            left: `calc(50% - 12px + ${position.x * 0.1}px)`,
            top: `${150 + lanyardStretch}px`
          }}
        />
      </div>

      {/* Hanging ID Card */}
      <div
        ref={cardRef}
        className={`absolute transition-all duration-300 ${isDragging ? 'scale-105' : 'hover:scale-102'}`}
        style={{
          left: `calc(50% - 120px + ${position.x}px)`,
          top: `calc(160px + ${position.y + lanyardStretch}px)`,
          transform: `rotate(${(position.x * 0.02) + (lanyardStretch * 0.01)}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Card Shadow */}
        <div className="absolute inset-0 bg-black/20 rounded-lg blur-sm transform translate-y-3 translate-x-1 opacity-40" />
        
        {/* Main ID Card - Black and White Design */}
        <div className="relative w-60 h-80 bg-white border-2 border-black rounded-lg overflow-hidden shadow-2xl">
          {/* Card Header - Black */}
          <div className="h-16 bg-black relative flex items-center justify-between px-4">
            <div className="text-white">
              <div className="text-xs font-mono font-bold">EMPLOYEE ID</div>
              <div className="text-sm font-mono">#DEV-2024</div>
            </div>
            <div className="w-8 h-8 bg-white rounded border border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="relative bg-white p-4 border-b-2 border-black">
            <div className="w-24 h-24 mx-auto bg-gray-100 border-2 border-black rounded overflow-hidden">
              <img 
                src={profilePhoto} 
                alt="Kundan Ray" 
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>

          {/* Card Content - White background */}
          <div className="p-4 text-center bg-white">
            <h2 className="text-xl font-bold text-black mb-1 font-mono">KUNDAN RAY</h2>
            <p className="text-sm text-black font-mono mb-1">SENIOR FULL-STACK ENGINEER</p>
            <p className="text-xs text-gray-600 font-mono mb-3">KATHMANDU, NEPAL</p>

            {/* Quick Info */}
            <div className="space-y-1 mb-3 text-xs font-mono">
              <div className="flex items-center justify-center space-x-1 text-black">
                <span>●</span>
                <span>kundanray.com.np</span>
              </div>
              <div className="flex items-center justify-center space-x-1 text-black">
                <span>●</span>
                <span>hello@kundan.ray</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1 mb-3">
              <Button
                onClick={() => handleCall('phone')}
                className="flex-1 h-7 text-xs bg-black hover:bg-gray-800 text-white font-mono"
              >
                <Phone size={10} className="mr-1" />
                CALL
              </Button>
              <Button
                onClick={() => handleCall('email')}
                className="flex-1 h-7 text-xs bg-white hover:bg-gray-100 text-black border border-black font-mono"
              >
                <Mail size={10} className="mr-1" />
                EMAIL
              </Button>
              <Button
                onClick={() => handleCall('website')}
                className="flex-1 h-7 text-xs bg-black hover:bg-gray-800 text-white font-mono"
              >
                <Globe size={10} className="mr-1" />
                WEB
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-2">
              <button className="w-6 h-6 bg-black hover:bg-gray-800 text-white rounded flex items-center justify-center transition-colors">
                <Github size={12} />
              </button>
              <button className="w-6 h-6 bg-black hover:bg-gray-800 text-white rounded flex items-center justify-center transition-colors">
                <Linkedin size={12} />
              </button>
              <button className="w-6 h-6 bg-black hover:bg-gray-800 text-white rounded flex items-center justify-center transition-colors">
                <Globe size={12} />
              </button>
            </div>
          </div>

          {/* Card Footer - Black */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-black flex items-center justify-center">
            <div className="text-xs font-mono text-white font-bold">
              VALID: ∞ | ACCESS: FULL-STACK
            </div>
          </div>

          {/* Security Pattern */}
          <div className="absolute top-0 right-0 w-8 h-8 opacity-10">
            <div className="w-full h-full bg-black transform rotate-45"></div>
          </div>
        </div>
      </div>

      {/* Drag Instruction */}
      <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono opacity-60">
        🖱️ Pull the lanyard to move
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
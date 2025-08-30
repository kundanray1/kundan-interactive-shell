import { useState, useRef, useEffect, useCallback } from 'react';
import { Phone, Mail, MapPin, Globe, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpring, animated } from '@react-spring/web';
// Using profile photo from public folder
const profilePhoto = '/IMG_2298.webp';

// Multi-segment rope physics component
const LanyardStraps = ({ position, lanyardStretch, isDragging, isAnimating }: {
  position: { x: number; y: number };
  lanyardStretch: number;
  isDragging: boolean;
  isAnimating: boolean;
}) => {
  // Configuration for rope physics
  const numSegments = 8;
  
  // Calculate rope segments with realistic physics
  const calculateRopeSegments = (startX: number, endX: number, startY: number, endY: number) => {
    const segments: Array<{ x: number; y: number }> = [];
    const totalDistance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const gravity = 0.3; // Gravity effect on rope sag
    
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments; // Parameter from 0 to 1
      
      // Linear interpolation for base position
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      
      // Add realistic sag (catenary-like curve)
      const sag = Math.sin(t * Math.PI) * (gravity * totalDistance * 0.1 + lanyardStretch * 0.3);
      
      segments.push({
        x: baseX,
        y: baseY + sag
      });
    }
    
    return segments;
  };

  // Get container dimensions for proper positioning
  const containerWidth = window.innerWidth / 2; // Left half of screen
  const centerX = containerWidth / 2;
  
  // Card positioning info: left at 50% - 160px, width 320px (w-80)
  // So card left edge is at centerX - 160, right edge at centerX + 160
  
  // Left strap segments - start further apart at top, connect to card's left attachment point
  const leftStrapStart = { x: centerX - 120, y: 0 };
  const leftStrapEnd = { x: centerX - 140 + position.x, y: 170 + position.y + lanyardStretch };
  const leftSegments = calculateRopeSegments(leftStrapStart.x, leftStrapEnd.x, leftStrapStart.y, leftStrapEnd.y);
  
  // Right strap segments - start further apart at top, connect to card's right attachment point  
  const rightStrapStart = { x: centerX + 120, y: 0 };
  const rightStrapEnd = { x: centerX + 140 + position.x, y: 170 + position.y + lanyardStretch };
  const rightSegments = calculateRopeSegments(rightStrapStart.x, rightStrapEnd.x, rightStrapStart.y, rightStrapEnd.y);

  // Create smooth path from segments
  const createPathFromSegments = (segments: Array<{ x: number; y: number }>) => {
    if (segments.length < 2) return '';
    
    let path = `M ${segments[0].x} ${segments[0].y}`;
    
    // Use quadratic curves for smoother rope segments
    for (let i = 1; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      const controlX = current.x;
      const controlY = current.y;
      
      path += ` Q ${controlX} ${controlY} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
    }
    
    // End point
    const last = segments[segments.length - 1];
    path += ` T ${last.x} ${last.y}`;
    
    return path;
  };

  // Create single continuous strap using SVG
  const createContinuousStrap = (segments: Array<{ x: number; y: number }>, isLeft: boolean) => {
    if (segments.length < 2) return null;
    
    const strapWidth = 32;
    const pathData = createPathFromSegments(segments);
    
    return (
      <svg
        key={isLeft ? 'left' : 'right'}
        className={`absolute top-0 ${!isDragging && !isAnimating ? 'transition-all duration-200 ease-out' : ''}`}
        style={{
          left: '0',
          width: '100%',
          height: `${200 + position.y + lanyardStretch + 100}px`,
          overflow: 'visible'
        }}
      >
        {/* Main strap path */}
        <path
          d={pathData}
          stroke="black"
          strokeWidth={strapWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Watermark text along the path */}
        <defs>
          <path
            id={`strap-path-${isLeft ? 'left' : 'right'}`}
            d={pathData}
          />
        </defs>
        
        <text
          className="text-white text-[8px] font-mono font-bold opacity-60"
          fill="white"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="2px"
        >
          <textPath
            href={`#strap-path-${isLeft ? 'left' : 'right'}`}
            startOffset="10%"
          >
            KUNDAN RAY • KUNDAN RAY • KUNDAN RAY • KUNDAN RAY
          </textPath>
        </text>
      </svg>
    );
  };

  return (
    <div className="absolute top-0 left-0 right-0">
      {/* Left Strap - Single continuous strap */}
      {createContinuousStrap(leftSegments, true)}
      
      {/* Right Strap - Single continuous strap */}
      {createContinuousStrap(rightSegments, false)}

      {/* Anchor points at the top where straps attach */}
      <div 
        className="absolute w-4 h-4 bg-gray-800 rounded-full shadow-sm border-2 border-gray-600"
        style={{
          left: `${centerX - 120 - 8}px`,
          top: '-2px'
        }}
      />
      <div 
        className="absolute w-4 h-4 bg-gray-800 rounded-full shadow-sm border-2 border-gray-600"
        style={{
          left: `${centerX + 120 - 8}px`,
          top: '-2px'
        }}
      />

      {/* Connection bridge spanning between strap endpoints */}
      <div 
        className={`absolute h-2 bg-black ${!isDragging && !isAnimating ? 'transition-all duration-200 ease-out' : ''}`}
        style={{
          left: `${centerX - 140 + position.x}px`,
          top: `${170 + position.y + lanyardStretch}px`,
          width: `${280}px`, // Spans from left strap to right strap
          transform: `rotate(${position.x * 0.01}deg)`
        }}
      />
    </div>
  );
};

interface HangingIDCardProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
}

const HangingIDCard = ({ activeSection, onSectionClick }: HangingIDCardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lanyardStretch, setLanyardStretch] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const handlePointerDown = useCallback((e: React.PointerEvent | PointerEvent) => {
    e.preventDefault();
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }

    // Get the left container as reference (entire left side)
    const container = document.querySelector('.h-screen.relative.overflow-hidden') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    setDragStart({
      x: e.clientX - containerRect.left - position.x,
      y: e.clientY - containerRect.top - position.y
    });
    setIsDragging(true);
  }, [position.x, position.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const container = document.querySelector('.h-screen.relative.overflow-hidden') as HTMLElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      
      const newX = e.clientX - containerRect.left - dragStart.x;
      const newY = e.clientY - containerRect.top - dragStart.y;

      // Realistic lanyard physics - much wider movement area
      const centerX = containerRect.width / 2;
      const maxSwing = containerRect.width / 2 - 80; // Can move almost to edges
      const maxDrop = containerRect.height / 2; // Can drop much further
      
      // Allow movement up as well (lanyard can be pulled up)
      const constrainedX = Math.max(-maxSwing, Math.min(maxSwing, newX));
      const constrainedY = Math.max(-80, Math.min(maxDrop, newY));

      setPosition({
        x: constrainedX,
        y: constrainedY
      });

      // Realistic lanyard stretch - cloth behavior
      const horizontalDistance = Math.abs(constrainedX);
      const verticalDistance = Math.max(0, constrainedY + 80); // Account for upward movement
      const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
      
      // Cloth stretches more realistically
      const stretch = Math.min(totalDistance * 0.15, 60);
      setLanyardStretch(stretch);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      
      // Smooth return animation with physics
      setIsAnimating(true);
      const startPos = { ...position };
      const startStretch = lanyardStretch;
      const startTime = Date.now();
      const duration = 800; // Animation duration
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function - elastic out
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress) * Math.cos((progress * 10 - 0.75) * (2 * Math.PI) / 3);
        
        const newX = startPos.x * (1 - easeOut);
        const newY = startPos.y * (1 - easeOut);
        const newStretch = startStretch * (1 - easeOut);
        
        setPosition({ x: newX, y: newY });
        setLanyardStretch(newStretch);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, position, lanyardStretch]);

  // Add global pointer events for entire left container
  useEffect(() => {
    const container = document.querySelector('.h-screen.relative.overflow-hidden') as HTMLElement;
    if (!container) return;

    const handleContainerPointerDown = (e: PointerEvent) => {
      // Only handle if clicking in the container area (not on buttons/navigation)
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.navigation')) return;
      
      handlePointerDown(e);
    };

    container.addEventListener('pointerdown', handleContainerPointerDown);
    container.style.cursor = 'grab';

    return () => {
      container.removeEventListener('pointerdown', handleContainerPointerDown);
      container.style.cursor = '';
    };
  }, [handlePointerDown]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);


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
      window.open('mailto:raykundan57@gmail.com');
    } else {
      window.open('https://kundanray.com.np', '_blank');
    }
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-primary opacity-10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent-primary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent-secondary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Realistic Lanyard Straps with Multi-Segment Rope Physics */}
      <LanyardStraps position={position} lanyardStretch={lanyardStretch} isDragging={isDragging} isAnimating={isAnimating} />

      {/* Hanging ID Card */}
      <div
        ref={cardRef}
        className={`absolute ${!isDragging && !isAnimating ? 'transition-all duration-300' : ''} ${isDragging ? 'scale-105' : 'hover:scale-102'}`}
        style={{
          left: `calc(50% - 160px + ${position.x}px)`,
          top: `calc(170px + ${position.y + lanyardStretch}px)`,
          transform: `rotate(${(position.x * 0.02) + (lanyardStretch * 0.01)}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Card Shadow */}
        <div className="absolute inset-0 bg-black/20 rounded-lg blur-sm transform translate-y-3 translate-x-1 opacity-40" />
        
        {/* Main ID Card - Black and White Design - Longer */}
        <div className="relative w-80 h-[32rem] bg-white border-2 border-black rounded-lg overflow-hidden shadow-2xl">
          {/* Card Header - Black */}
          <div className="h-16 bg-black relative flex items-center justify-between px-4">
            <div className="text-white">
              <div className="text-xs font-mono font-bold">Human ID</div>
              <div className="text-sm font-mono">#DEV-1997</div>
            </div>
            <div className="w-8 h-8 bg-white rounded border border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="relative bg-white p-6 border-b-2 border-black">
            <div className="w-32 h-32 mx-auto bg-gray-100 border-2 border-black rounded-full overflow-hidden">
              <img 
                src={profilePhoto} 
                alt="Kundan Ray" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card Content - White background */}
          <div className="p-6 text-center bg-white">
            <h2 className="text-2xl font-bold text-black mb-2 font-mono">KUNDAN RAY</h2>
            <p className="text-base text-black font-mono mb-1">SENIOR FULL-STACK ENGINEER</p>
            <p className="text-sm text-gray-600 font-mono mb-2">KATHMANDU, NEPAL</p>
            <p className="text-xs text-gray-500 font-mono mb-4">→ MELBOURNE, VICTORIA, AUSTRALIA</p>

            {/* Quick Info */}
            <div className="space-y-1 mb-3 text-xs font-mono">
         
              <div className="flex items-center justify-center space-x-1 text-black">
                <span>●</span>
                <span>raykundan57@gmail.com</span>
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
            <div className="flex justify-center space-x-2 mb-4 ">
              <button className="w-6 h-6 bg-black hover:bg-gray-800 text-white rounded flex items-center justify-center transition-colors">
                <GitBranch size={12} />
              </button>
        
            </div>
          </div>

          {/* Card Footer - Black */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-black flex items-center justify-center">
            <div className="text-xs font-mono text-white font-bold">
              VALID: Till Death | ACCESS: GOD-LEVEL
            </div>
          </div>

          {/* Security Pattern & Watermarks */}
          <div className="absolute top-0 right-0 w-8 h-8 opacity-10">
            <div className="w-full h-full bg-black transform rotate-45"></div>
          </div>
          
          {/* Watermark Text */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-4 transform -rotate-45 opacity-5 text-xs font-mono text-black">
              KUNDAN RAY
            </div>
            <div className="absolute bottom-32 right-4 transform rotate-45 opacity-5 text-xs font-mono text-black">
              DEV-2024
            </div>
            <div className="absolute bottom-20 left-6 transform -rotate-12 opacity-5 text-xs font-mono text-black">
              ENGINEER
            </div>
          </div>
        </div>
      </div>

      {/* Drag Instruction */}
      <div className="absolute top-4 right-4 text-xs font-mono">
        <div className="bg-black/80 text-white px-2 py-1 rounded-md shadow-lg backdrop-blur-sm">
          🖱️ Pull the lanyard to move
        </div>
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
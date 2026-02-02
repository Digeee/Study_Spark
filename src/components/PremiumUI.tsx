import { ReactNode, useEffect, useRef } from 'react';

interface ParticleFieldProps {
  children: ReactNode;
  className?: string;
  density?: 'low' | 'medium' | 'high';
  interaction?: boolean;
}

export function ParticleField({ children, className = '', density = 'medium', interaction = true }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particleCount = density === 'high' ? 100 : density === 'medium' ? 60 : 30;
    const particles: Particle[] = [];
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() * 60 + 260; // Purple range
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary check
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
        // Mouse interaction
        if (interaction && mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            this.vx += dx * force * 0.001;
            this.vy += dy * force * 0.001;
          }
        }
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Mouse position tracking
    const mouse = { x: null as number | null, y: null as number | null };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    if (interaction) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.2;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(262, 83%, 58%, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interaction) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, interaction]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface MorphingBlobProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  speed?: 'slow' | 'normal' | 'fast';
}

export function MorphingBlob({ 
  className = '', 
  color = 'from-purple-500/20 via-pink-500/20 to-blue-500/20', 
  size = 'md',
  speed = 'normal' 
}: MorphingBlobProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };
  
  const animationClasses = {
    slow: 'animate-pulse',
    normal: 'animate-pulse-slow',
    fast: 'animate-bounce'
  };

  return (
    <div className={`absolute ${sizeClasses[size]} ${className}`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${color} blur-xl ${animationClasses[speed]}`} />
      <div className={`absolute inset-2 rounded-full bg-gradient-to-l ${color} blur-lg ${animationClasses[speed === 'slow' ? 'normal' : speed === 'normal' ? 'slow' : 'normal']}`} />
      <div className={`absolute inset-4 rounded-full bg-gradient-to-t ${color} blur-md ${animationClasses[speed === 'fast' ? 'normal' : speed === 'normal' ? 'slow' : 'slow']}`} />
    </div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'rainbow';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function GradientText({ 
  children, 
  variant = 'primary', 
  className = '',
  size = 'md'
}: GradientTextProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary via-purple-500 to-indigo-500',
    accent: 'bg-gradient-to-r from-accent via-pink-500 to-rose-500',
    success: 'bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500',
    rainbow: 'bg-gradient-to-r from-purple-500 via-pink-500 via-blue-500 via-green-500 to-yellow-500'
  };

  return (
    <span className={`${sizeClasses[size]} ${gradientClasses[variant]} bg-clip-text text-transparent font-semibold ${className}`}>
      {children}
    </span>
  );
}

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function ShimmerButton({ 
  children, 
  className = '', 
  onClick,
  disabled = false,
  variant = 'primary'
}: ShimmerButtonProps) {
  const baseClasses = "relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-xl hover:shadow-purple-500/25 focus:ring-primary",
    secondary: "bg-gradient-to-r from-secondary to-purple-100 text-purple-800 hover:shadow-lg hover:shadow-purple-200/50 focus:ring-purple-300",
    ghost: "bg-transparent text-foreground hover:bg-primary/10 focus:ring-primary/30"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
    </button>
  );
}

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'default' | 'glass' | 'neumorphic';
}

export function FloatingCard({ 
  children, 
  className = '', 
  delay = 0,
  variant = 'default'
}: FloatingCardProps) {
  const baseClasses = "rounded-2xl p-6 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl";
  
  const variantClasses = {
    default: "bg-white/80 backdrop-blur-xl border border-white/30 shadow-xl",
    glass: "glass-card",
    neumorphic: "neumorphic"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className} animate-float`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
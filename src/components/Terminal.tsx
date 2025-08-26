import { useState, useRef, useEffect } from 'react';
import { Command, Terminal as TerminalIcon, Copy, Minimize2, Maximize2, X } from 'lucide-react';

interface TerminalProps {
  onSectionChange?: (section: string) => void;
}

interface CommandHistory {
  command: string;
  output: string[];
  type: 'success' | 'error' | 'info';
}

const Terminal = ({ onSectionChange }: TerminalProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: 'welcome',
      output: [
        'Welcome to Kundan Ray\'s interactive resume!',
        'Type "kundan --help" or "help" to see available commands.',
        'Or click a section tag above ↗'
      ],
      type: 'info'
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const resumeData = {
    about: {
      summary: "Senior Full-Stack Engineer—loves playful UI and robust terminal tooling.",
      details: "Passionate about creating delightful user experiences while building scalable backend systems. I enjoy bridging the gap between design and development, with a particular love for terminal interfaces and developer tooling."
    },
    skills: [
      { name: "TypeScript", level: "expert", tags: ["frontend", "backend"] },
      { name: "React/Next.js", level: "expert", tags: ["frontend", "ui"] },
      { name: "Node.js/NestJS", level: "advanced", tags: ["backend", "api"] },
      { name: "Tailwind/Motion", level: "advanced", tags: ["frontend", "ux"] },
      { name: "Postgres/Prisma", level: "advanced", tags: ["db"] },
      { name: "Docker/AWS", level: "advanced", tags: ["devops"] }
    ],
    projects: [
      {
        name: "Provocative",
        summary: "Lean AWS-like platform for data-center owners.",
        featured: true,
        tags: ["react", "node", "infra"],
        tech: "React, Node.js, Docker, AWS"
      },
      {
        name: "LintAI",
        summary: "AI-powered code scanning with graph visualisation.",
        featured: true,
        tags: ["ai", "visualisation", "node"],
        tech: "Node.js, AI/ML, D3.js"
      }
    ],
    experience: [
      {
        role: "Senior Full-Stack Engineer",
        company: "Freelance",
        period: "2022–Present",
        bullets: [
          "End-to-end product ownership (ideation → infra).",
          "Shipped UI systems with motion & accessibility.",
          "Led multi-tenant architecture deployments."
        ]
      }
    ],
    contact: {
      email: "hello@kundan.ray",
      location: "Kathmandu, Nepal",
      availability: "Open to remote roles"
    }
  };

  const parseCommand = (cmd: string): CommandHistory => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'kundan':
        if (args[0] === '--help' || args[0] === '-h') {
          return {
            command: cmd,
            output: [
              'Usage: command [options]',
              '',
              'Available commands:',
              '  kundan --help     Show this help message',
              '  whoami           Short bio and current focus',
              '  open <section>   Open CV section (about, skills, projects, experience, contact)',
              '  ls sections      List all available sections',
              '  skills [level]   Show skills, optionally filter by level',
              '  projects         List featured projects',
              '  experience       Show work experience',
              '  contact          Show contact information',
              '  socials          List social links',
              '  clear            Clear terminal',
              '  theme <mode>     Switch theme (light/dark)',
              '',
              'Examples:',
              '  open about',
              '  skills expert',
              '  open projects'
            ],
            type: 'info'
          };
        }
        break;

      case 'help':
      case '--help':
      case '-h':
        return parseCommand('kundan --help');

      case 'whoami':
        return {
          command: cmd,
          output: [
            'Kundan Ray',
            resumeData.about.summary,
            '',
            resumeData.about.details
          ],
          type: 'success'
        };

      case 'open':
        const section = args[0];
        if (!section) {
          return {
            command: cmd,
            output: ['Error: Please specify a section to open.', 'Usage: open <section>'],
            type: 'error'
          };
        }

        onSectionChange?.(section);

        switch (section) {
          case 'about':
            return {
              command: cmd,
              output: [
                '📍 About Kundan Ray',
                '',
                resumeData.about.summary,
                '',
                resumeData.about.details
              ],
              type: 'success'
            };

          case 'skills':
            return {
              command: cmd,
              output: [
                '🛠️ Technical Skills',
                '',
                ...resumeData.skills.map(skill => 
                  `${skill.name.padEnd(20)} ${skill.level.padEnd(12)} [${skill.tags.join(', ')}]`
                )
              ],
              type: 'success'
            };

          case 'projects':
            return {
              command: cmd,
              output: [
                '🧩 Featured Projects',
                '',
                ...resumeData.projects.map(project => [
                  `${project.name}${project.featured ? ' ⭐' : ''}`,
                  `  ${project.summary}`,
                  `  Tech: ${project.tech}`,
                  `  Tags: ${project.tags.join(', ')}`,
                  ''
                ]).flat()
              ],
              type: 'success'
            };

          case 'experience':
            return {
              command: cmd,
              output: [
                '🏢 Work Experience',
                '',
                ...resumeData.experience.map(exp => [
                  `${exp.role} @ ${exp.company}`,
                  `${exp.period}`,
                  '',
                  ...exp.bullets.map(bullet => `• ${bullet}`),
                  ''
                ]).flat()
              ],
              type: 'success'
            };

          case 'contact':
            return {
              command: cmd,
              output: [
                '✉️ Contact Information',
                '',
                `Email: ${resumeData.contact.email}`,
                `Location: ${resumeData.contact.location}`,
                `Status: ${resumeData.contact.availability}`
              ],
              type: 'success'
            };

          default:
            return {
              command: cmd,
              output: [
                `Section "${section}" not found.`,
                'Available sections: about, skills, projects, experience, contact'
              ],
              type: 'error'
            };
        }

      case 'ls':
        if (args[0] === 'sections') {
          return {
            command: cmd,
            output: [
              'Available sections:',
              '  about       Personal summary and background',
              '  skills      Technical skills and expertise levels',
              '  projects    Featured projects and work',
              '  experience  Professional work history',
              '  contact     Contact information and availability'
            ],
            type: 'success'
          };
        }
        break;

      case 'skills':
        const levelFilter = args[0];
        let filteredSkills = resumeData.skills;
        
        if (levelFilter) {
          filteredSkills = resumeData.skills.filter(skill => skill.level === levelFilter);
          if (filteredSkills.length === 0) {
            return {
              command: cmd,
              output: [
                `No skills found with level "${levelFilter}".`,
                'Available levels: beginner, intermediate, advanced, expert'
              ],
              type: 'error'
            };
          }
        }

        return {
          command: cmd,
          output: [
            '🛠️ Technical Skills',
            levelFilter ? `Filtered by: ${levelFilter}` : '',
            '',
            'SKILL                LEVEL        TAGS',
            '─'.repeat(50),
            ...filteredSkills.map(skill => 
              `${skill.name.padEnd(20)} ${skill.level.padEnd(12)} [${skill.tags.join(', ')}]`
            )
          ].filter(Boolean),
          type: 'success'
        };

      case 'projects':
        return parseCommand('open projects');

      case 'experience':
        return parseCommand('open experience');

      case 'contact':
        return parseCommand('open contact');

      case 'socials':
        return {
          command: cmd,
          output: [
            '🔗 Social Links',
            '',
            'GitHub     → github.com/kundanray',
            'LinkedIn   → linkedin.com/in/kundanray',
            'X/Twitter  → x.com/kundanray'
          ],
          type: 'success'
        };

      case 'clear':
        setHistory([]);
        return {
          command: cmd,
          output: [],
          type: 'success'
        };

      case 'theme':
        const mode = args[0];
        if (!mode || !['light', 'dark', 'system'].includes(mode)) {
          return {
            command: cmd,
            output: [
              'Usage: theme <light|dark|system>',
              'Example: theme dark'
            ],
            type: 'error'
          };
        }
        // Theme switching logic would go here
        return {
          command: cmd,
          output: [`Theme switched to ${mode}`],
          type: 'success'
        };

      default:
        return {
          command: cmd,
          output: [
            `Command "${command}" not found.`,
            'Type "help" to see available commands.'
          ],
          type: 'error'
        };
    }

    return {
      command: cmd,
      output: ['Command not implemented yet.'],
      type: 'error'
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const result = parseCommand(input);
    
    if (result.command !== 'clear') {
      setHistory(prev => [...prev, result]);
    }
    
    setCommandHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getOutputColor = (type: CommandHistory['type']) => {
    switch (type) {
      case 'error': return 'text-terminal-error';
      case 'success': return 'text-terminal-success';
      default: return 'text-terminal-text';
    }
  };

  return (
    <div className="h-full bg-terminal-bg border border-visual-border rounded-terminal shadow-terminal">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-terminal-chrome border-b border-visual-border rounded-t-terminal">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-terminal-error rounded-full" />
            <div className="w-3 h-3 bg-accent-tertiary rounded-full" />
            <div className="w-3 h-3 bg-terminal-success rounded-full" />
          </div>
          <span className="text-muted-foreground text-sm font-mono ml-4">
            kundan@portfolio: ~
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-visual-border rounded transition-colors">
            <Minimize2 size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-visual-border rounded transition-colors">
            <Maximize2 size={14} className="text-muted-foreground" />
          </button>
          <button className="p-1 hover:bg-visual-border rounded transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-[calc(100%-3rem)] overflow-y-auto p-terminal font-mono text-sm"
      >
        {/* Command History */}
        {history.map((item, index) => (
          <div key={index} className="mb-4">
            {item.command && item.command !== 'welcome' && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-terminal-prompt">kundan@ray.dev$</span>
                <span className="text-terminal-accent">{item.command}</span>
              </div>
            )}
            <div className={`whitespace-pre-wrap ${getOutputColor(item.type)}`}>
              {item.output.join('\n')}
            </div>
          </div>
        ))}

        {/* Current Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-terminal-prompt">kundan@ray.dev$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-terminal-accent font-mono"
            placeholder="Type 'help' for commands..."
            spellCheck={false}
            autoComplete="off"
          />
          <span className="text-terminal-accent animate-cursor">▊</span>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
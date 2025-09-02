import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
// Removed unused imports for terminal buttons
import { getAIResponse } from '@/lib/openai';
import lifeEventsData from '@/data/lifeEvents.json';

// Funny loader component
const FunnyLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  
  const funnyMessages = [
    "🤖 Booting up AI neurons...",
    "🧠 Consulting the digital brain cells...",
    "⚡ Charging up the knowledge capacitors...", 
    "🔍 Searching through Kundan's memories...",
    "🚀 Launching artificial intelligence rockets...",
    "🎯 Targeting the perfect response...",
    "🎪 Teaching monkeys to code... wait, wrong process!",
    "🔮 Consulting the crystal ball of knowledge...",
    "🎭 AI is having an existential crisis... standby!",
    "🍕 Ordering pizza for the algorithms... they're hungry!",
    "🦄 Catching unicorns in the data streams...",
    "🎮 Playing chess with the neural networks...",
    "🎨 AI is finger-painting with data...",
    "🎪 Running away to join the machine learning circus...",
    "🚂 All aboard the AI express train! Choo choo!",
    "🎵 AI is composing a symphony of responses...",
    "🧙‍♂️ Casting algorithmic spells...",
    "🎲 Rolling dice with probability distributions...",
    "🦋 Metamorphosis of data into wisdom...",
    "🎪 The AI circus is in town! 🤡"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % funnyMessages.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-3 text-accent-primary">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <div className="relative">
        <span className="animate-pulse">{funnyMessages[messageIndex]}</span>
        <span className="absolute -top-1 -right-1 text-xs animate-spin">⚡</span>
      </div>
    </div>
  );
};

interface TerminalProps {
  onSectionChange?: (section: string) => void;
}

export interface TerminalHandle {
  insertCommand: (command: string) => void;
}

interface CommandHistory {
  command: string;
  output: string[];
  type: 'success' | 'error' | 'info';
}

const Terminal = forwardRef<TerminalHandle, TerminalProps>(({ onSectionChange }, ref) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: 'welcome',
      output: [
        '🎯 Welcome to Kundan Ray\'s AI-Powered Interactive Resume!',
        '',
        '💬 Talk naturally: "Tell me about your startup experience"',
        '⌨️  Use commands: "life-events --startup" or "help"',
        '🔍 Ask anything: "What technologies do you work with?"',
        '',
        'This terminal supports both natural conversation and commands!'
      ],
      type: 'info'
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Combine static resume data with dynamic life events
  const resumeData = {
    ...lifeEventsData,
    // Keep some legacy data for compatibility
    about: {
      summary: "Senior Full-Stack Engineer from Nepal—bridging technology and creativity in the Himalayas.",
      details: "Passionate about creating delightful user experiences while building scalable systems. Co-founded a fintech startup and love integrating AI into practical applications."
    }
  };

  // Helper function to detect if input is a natural language query
  const isNaturalLanguage = (input: string): boolean => {
    const naturalPatterns = [
      /^(tell me|what|how|when|where|why|who|can you|do you|are you|have you)/i,
      /\?$/,
      /^(i want to know|i'm curious|explain|describe)/i,
      /^(show me|give me|find)/i
    ];
    return naturalPatterns.some(pattern => pattern.test(input.trim()));
  };

  const parseCommand = async (cmd: string): Promise<CommandHistory> => {
    const trimmed = cmd.trim();
    
    // If it looks like natural language, send to AI immediately
    if (isNaturalLanguage(trimmed)) {
      const ai = await getAIResponse(trimmed, resumeData);
      return {
        command: cmd,
        output: [ai],
        type: 'info'
      };
    }

    const parts = trimmed.toLowerCase().split(' ');
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
              '  life-events      Show major life events timeline',
              '  life-events --<tag>  Filter events by tag (e.g. --career, --skill)',
              '  achievements     List major achievements',
              '  interests        Show personal interests',
              '  timeline         Show complete chronological timeline',
              '  search <term>    Search through life events and data',
              '  clear            Clear terminal',
              '  theme <mode>     Switch theme (light/dark)',
              '',
              '💬 Natural Language:',
              '  Just ask naturally! Examples:',
              '  "Tell me about your startup experience"',
              '  "What technologies do you use?"',
              '  "When did you start programming?"',
              '',
              'Command Examples:',
              '  open about',
              '  skills expert',
              '  life-events --startup',
              '  achievements'
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
            return parseCommand('skills');

          case 'projects':
            return {
              command: cmd,
              output: [
                '🧩 Featured Projects',
                '',
                ...resumeData.projects.map(project => [
                  `${project.name} ${project.status === 'active' ? '🚀' : '✅'}`,
                  `  ${project.description}`,
                  `  Tech: ${project.tech.join(', ')}`,
                  `  Status: ${project.status}`,
                  ''
                ]).flat()
              ],
              type: 'success'
            };

          case 'experience':
            const careerEvents = resumeData.lifeEvents.filter(event => event.type === 'career');
            return {
              command: cmd,
              output: [
                '🏢 Professional Experience',
                '',
                ...careerEvents.reverse().map(event => [
                  `${new Date(event.date).getFullYear()} - ${event.title}`,
                  `  ${event.description}`,
                  `  Impact: ${event.impact}`,
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
                `Name: ${resumeData.personalInfo.name}`,
                `Title: ${resumeData.personalInfo.title}`,
                `Email: ${resumeData.personalInfo.email}`,
                `Website: ${resumeData.personalInfo.website}`,
                `Location: ${resumeData.personalInfo.location}`
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
        const skillsOutput = [];
        skillsOutput.push('🛠️ Technical Skills');
        skillsOutput.push('');
        
        Object.entries(resumeData.skills).forEach(([category, skills]) => {
          skillsOutput.push(`${category.toUpperCase()}:`);
          skills.forEach(skill => {
            skillsOutput.push(`  • ${skill}`);
          });
          skillsOutput.push('');
        });
        
        return {
          command: cmd,
          output: skillsOutput,
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
            'X/Twitter  → x.com/kundanray',
            'Website    → kundanray.com.np'
          ],
          type: 'success'
        };

      case 'life-events':
        let filteredEvents = resumeData.lifeEvents;
        
        // Check for tag filter (e.g., life-events --career)
        if (args[0] && args[0].startsWith('--')) {
          const tag = args[0].substring(2);
          filteredEvents = resumeData.lifeEvents.filter(event => 
            event.tags.includes(tag) || event.type === tag
          );
          
          if (filteredEvents.length === 0) {
            return {
              command: cmd,
              output: [
                `No life events found with tag "${tag}".`,
                'Available tags: ' + Array.from(new Set(resumeData.lifeEvents.flatMap(e => e.tags))).join(', ')
              ],
              type: 'error'
            };
          }
        }
        
        return {
          command: cmd,
          output: [
            '📅 Life Events Timeline',
            args[0] ? `Filtered by: ${args[0].substring(2)}` : '',
            '',
            ...filteredEvents.map(event => [
              `${new Date(event.date).getFullYear()} - ${event.title} ${event.type === 'milestone' ? '🎆' : event.type === 'career' ? '💼' : event.type === 'achievement' ? '🏆' : '📚'}`,
              `  ${event.description}`,
              `  Impact: ${event.impact}`,
              `  Tags: ${event.tags.join(', ')}`,
              ''
            ]).flat()
          ].filter(Boolean),
          type: 'success'
        };

      case 'achievements':
        return {
          command: cmd,
          output: [
            '🏆 Major Achievements',
            '',
            ...resumeData.achievements.map(achievement => `• ${achievement}`)
          ],
          type: 'success'
        };

      case 'interests':
        return {
          command: cmd,
          output: [
            '🎨 Personal Interests',
            '',
            ...resumeData.interests.map(interest => `• ${interest}`)
          ],
          type: 'success'
        };

      case 'clear':
        return {
          command: 'clear',
          output: [],
          type: 'info'
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

      case 'timeline':
        const sortedEvents = [...resumeData.lifeEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return {
          command: cmd,
          output: [
            '📅 Complete Life Timeline',
            '',
            ...sortedEvents.map(event => 
              `${new Date(event.date).toISOString().split('T')[0]} | ${event.title} (${event.type})`
            )
          ],
          type: 'success'
        };

      case 'search':
        if (!args[0]) {
          return {
            command: cmd,
            output: [
              'Usage: search <term>',
              'Search through life events and resume data',
              'Example: search startup'
            ],
            type: 'error'
          };
        }
        
        const searchTerm = args.join(' ').toLowerCase();
        const matchingEvents = resumeData.lifeEvents.filter(event =>
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        if (matchingEvents.length === 0) {
          return {
            command: cmd,
            output: [`No results found for "${searchTerm}"`],
            type: 'error'
          };
        }
        
        return {
          command: cmd,
          output: [
            `🔍 Search Results for "${searchTerm}" (${matchingEvents.length} found):`,
            '',
            ...matchingEvents.map(event => [
              `${new Date(event.date).getFullYear()} - ${event.title}`,
              `  ${event.description}`,
              ''
            ]).flat()
          ],
          type: 'success'
        };

      default:
        // For unrecognized commands, try AI assistance
        const ai = await getAIResponse(`Command: ${cmd}`, resumeData);
        return {
          command: cmd,
          output: [
            `Command '${command}' not recognized. AI Assistant:`,
            '',
            ai,
            '',
            'Type "help" for available commands.'
          ],
          type: 'info'
        };
    }

    // This should never be reached due to the default case above
    return {
      command: cmd,
      output: ['Unknown command. Type "help" for available commands.'],
      type: 'error'
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input;
    setIsProcessing(true);
    
    // Add command to history immediately  
    setHistory(prev => [...prev, {
      command: cmd,
      output: [],
      type: 'info'
    }]);
    
    setInput('');

    try {
      const result = await parseCommand(cmd);

      if (result.command === 'clear') {
        setHistory([]);
      } else {
        // Update the last entry with results
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = result;
          return newHistory;
        });
      }

      setCommandHistory(prev => [...prev, cmd]);
      setHistoryIndex(-1);
    } finally {
      setIsProcessing(false);
    }
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

  // Re-focus input after AI responses
  useEffect(() => {
    if (!isProcessing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  // Handle terminal container click to focus input
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Expose insertCommand method via ref
  useImperativeHandle(ref, () => ({
    insertCommand: (command: string) => {
      setInput(command);
      inputRef.current?.focus();
    }
  }));

  const getOutputColor = (type: CommandHistory['type']) => {
    switch (type) {
      case 'error': return 'text-terminal-error';
      case 'success': return 'text-terminal-success';
      default: return 'text-terminal-text';
    }
  };

  return (
    <div 
      className={`h-full w-full max-w-4xl bg-terminal-bg border rounded-terminal shadow-terminal flex flex-col cursor-text transition-all duration-200 ${
        isFocused ? 'border-accent-primary shadow-glow' : 'border-visual-border'
      }`}
      onClick={handleTerminalClick}
    >
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
        <div className="text-sm text-muted-foreground font-mono">
          AI Terminal v2.0
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-terminal font-mono text-sm"
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
              {item.output.length === 0 && isProcessing && index === history.length - 1 ? (
                <FunnyLoader />
              ) : (
                item.output.join('\n')
              )}
            </div>
          </div>
        ))}

        {/* Current Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-terminal-prompt">kundan@ray.dev$</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isProcessing}
              className="w-full bg-transparent border-none outline-none text-terminal-accent font-mono disabled:opacity-50"
              placeholder={isProcessing ? "Processing..." : "Type 'help' for commands..."}
              spellCheck={false}
              autoComplete="off"
            />
            {!isProcessing && (
              <span className="absolute top-0 text-terminal-accent animate-pulse" 
                    style={{ left: `${input.length * 0.6}em` }}>
                ▊
              </span>
            )}
          </div>
          {isProcessing && (
            <div className="flex items-center space-x-2 text-accent-primary">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
              </div>
              <span className="text-xs animate-pulse">🤔 Thinking...</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});

export default Terminal;
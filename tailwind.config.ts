import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				// Custom resume site colors
				'visual-bg': 'hsl(var(--visual-bg))',
				'visual-card': 'hsl(var(--visual-card))',
				'visual-border': 'hsl(var(--visual-border))',
				'terminal-bg': 'hsl(var(--terminal-bg))',
				'terminal-chrome': 'hsl(var(--terminal-chrome))',
				'terminal-text': 'hsl(var(--terminal-text))',
				'terminal-accent': 'hsl(var(--terminal-accent))',
				'terminal-prompt': 'hsl(var(--terminal-prompt))',
				'terminal-error': 'hsl(var(--terminal-error))',
				'terminal-success': 'hsl(var(--terminal-success))',
				'accent-primary': 'hsl(var(--accent-primary))',
				'accent-secondary': 'hsl(var(--accent-secondary))',
				'accent-tertiary': 'hsl(var(--accent-tertiary))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					hover: 'hsl(var(--card-hover))',
					shadow: 'hsl(var(--card-shadow))'
				}
			},
			fontFamily: {
				mono: 'var(--font-mono)',
				display: 'var(--font-display)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-terminal': 'var(--gradient-terminal)'
			},
			boxShadow: {
				'neumorphic': 'var(--shadow-neumorphic)',
				'terminal': 'var(--shadow-terminal)',
				'card-custom': 'var(--shadow-card)'
			},
			borderRadius: {
				'terminal': 'var(--radius-terminal)',
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)'
			},
			spacing: {
				'terminal': 'var(--space-terminal)',
				'card': 'var(--space-card)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'spring-bounce': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--accent-primary) / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(var(--accent-primary) / 0.6)' }
				},
				'terminal-cursor': {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'spring-bounce': 'spring-bounce 0.6s var(--spring-bounce)',
				'slide-up': 'slide-up 0.4s var(--smooth-ease)',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'cursor': 'terminal-cursor 1s infinite',
				'float': 'float 3s ease-in-out infinite'
			},
			transitionTimingFunction: {
				'spring': 'var(--spring-bounce)',
				'smooth': 'var(--smooth-ease)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

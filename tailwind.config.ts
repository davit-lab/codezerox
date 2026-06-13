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
  			'2xl': '1440px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			void: 'hsl(var(--bg-void))',
  			deep: 'hsl(var(--bg-deep))',
  			surface: 'hsl(var(--bg-surface))',
  			elevated: 'hsl(var(--bg-elevated))',
  			hover: 'hsl(var(--bg-hover))',
  			'bg-card': 'var(--bg-card)',
  			'bg-elevated': 'var(--bg-elevated)',
  			'border-subtle': 'var(--border-subtle)',
  			'border-light': 'var(--border-light)',
  			'text-white': 'var(--text-white)',
  			'text-primary': 'var(--text-primary)',
  			'text-secondary': 'var(--text-secondary)',
  			'text-muted': 'var(--text-muted)',
  			gold: {
  				DEFAULT: 'hsl(var(--gold))',
  				light: 'hsl(var(--gold-light))',
  				dark: 'hsl(var(--gold-dark))'
  			},
  			emerald: 'hsl(var(--emerald))',
  			ruby: 'hsl(var(--ruby))',
  			sapphire: 'hsl(var(--sapphire))',
  			amethyst: 'hsl(var(--amethyst))',
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
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-xl)'
  		},
  		fontFamily: {
  			georgian: [
  				'var(--font-georgian)',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-display)',
  				'serif'
  			],
  			body: [
  				'var(--font-body)',
  				'sans-serif'
  			],
  			mono: [
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			],
  			sans: [
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			serif: [
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			]
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			glow: 'var(--shadow-glow)',
  			gold: '0 4px 20px rgba(95, 19, 202, 0.4)',
  			'gold-lg': '0 8px 32px rgba(95, 19, 202, 0.5)'
  		},
  		transitionTimingFunction: {
  			'out-expo': 'var(--ease-out-expo)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'orb-float': {
  				'0%, 100%': {
  					transform: 'translate(0, 0) scale(1)',
  					opacity: '0.8'
  				},
  				'25%': {
  					transform: 'translate(40px, -30px) scale(1.05)',
  					opacity: '1'
  				},
  				'50%': {
  					transform: 'translate(-20px, 40px) scale(0.95)',
  					opacity: '0.7'
  				},
  				'75%': {
  					transform: 'translate(30px, 20px) scale(1.02)',
  					opacity: '0.9'
  				}
  			},
  			'pulse-dot': {
  				'0%, 100%': {
  					opacity: '1',
  					boxShadow: '0 0 0 0 rgba(52, 211, 153, 0.4)'
  				},
  				'50%': {
  					opacity: '0.8',
  					boxShadow: '0 0 0 8px rgba(52, 211, 153, 0)'
  				}
  			},
  			'hero-fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(40px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'hero-visual-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateX(60px) scale(0.95)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateX(0) scale(1)'
  				}
  			},
  			'avatar-ring': {
  				'0%, 100%': {
  					opacity: '0.5',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1.02)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'orb-float': 'orb-float 25s ease-in-out infinite',
  			'pulse-dot': 'pulse-dot 2s ease infinite',
  			'hero-fade-in': 'hero-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'hero-visual-in': 'hero-visual-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
  			'avatar-ring': 'avatar-ring 3s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

# Kundan Ray - Interactive Resume Terminal 🚀

A unique, AI-powered interactive resume built with React, TypeScript, and Node.js. Features a hanging ID card with realistic physics, an intelligent terminal interface, and comprehensive SEO optimization.

## 🌟 Features

- **Interactive Terminal**: Natural language AI conversations + traditional commands
- **Physics-Based ID Card**: Draggable hanging ID card with realistic lanyard physics  
- **AI Integration**: Google Gemini API for intelligent responses
- **Comprehensive SEO**: Optimized for search engines with structured data
- **Responsive Design**: Beautiful on all devices
- **Life Events Timeline**: Rich personal and professional history
- **Secure API**: Server-side proxy to hide API keys

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini API
- **Build**: Vite
- **Styling**: Tailwind CSS with custom animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd kundan-interactive-shell
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Development Setup**
   
   For development with hot reload:
   ```bash
   # Terminal 1: Start Vite dev server
   npm run dev
   
   # Terminal 2: Start Node.js API server  
   npm run server:dev
   ```

   Or run both concurrently:
   ```bash
   npm run dev:full
   ```

4. **Production Setup**
   
   Build and run in production:
   ```bash
   npm run start
   ```

   Or step by step:
   ```bash
   npm run build
   npm run server
   ```

## 📡 API Configuration

The Google Gemini API key is configured in `server.js`. The server acts as a secure proxy to hide the API key from client-side inspection.

### Environment Variables (Optional)
Create a `.env` file for additional configuration:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your-api-key-here
```

## 🎮 Terminal Commands

The terminal supports both natural language and traditional commands:

### Natural Language
- "Tell me about your experience with React"
- "What projects have you worked on?"
- "When did you start programming?"

### Commands
- `help` - Show all available commands
- `skills` - Display technical skills  
- `projects` - Show featured projects
- `life-events` - Display life timeline
- `life-events --career` - Filter by career events
- `search <term>` - Search through life events
- `timeline` - Show chronological timeline
- `contact` - Contact information

## 🏗️ Project Structure

```
├── src/
│   ├── components/
│   │   ├── HangingIDCard.tsx    # Physics-based ID card
│   │   ├── Terminal.tsx         # AI-powered terminal
│   │   └── ...
│   ├── data/
│   │   └── lifeEvents.json      # Personal/professional data
│   ├── lib/
│   │   └── openai.ts           # API communication
│   └── pages/
├── public/                      # Static assets
├── server.js                   # Node.js API server
└── package.json
```

## 🔒 Security Features

- **Server-side API Proxy**: API key never exposed to client
- **Rate Limiting**: Prevents API abuse  
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Request validation and sanitization

## 🎯 SEO Optimization

- **Dynamic Meta Tags**: Route-specific SEO optimization
- **Structured Data**: Rich snippets for search engines
- **Open Graph**: Social media sharing optimization
- **Sitemap Ready**: All routes properly indexed
- **Performance**: Optimized loading and caching

## 📱 Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Touch Friendly**: Interactive elements work on touch devices
- **Performance**: Smooth animations and interactions

## 🚀 Deployment

### Node.js Hosting (Recommended)
1. Build the project: `npm run build`
2. Upload `dist/`, `server.js`, `package.json` 
3. Install dependencies: `npm install --production`
4. Start server: `npm run server`

### Environment Setup
- Set `NODE_ENV=production`
- Configure `PORT` if needed
- Ensure API key is properly configured

## 🔧 Development

### Adding New Commands
Add commands in `src/components/Terminal.tsx` in the `parseCommand` function.

### Updating Life Events  
Edit `src/data/lifeEvents.json` to add new timeline events.

### Modifying Physics
Adjust the hanging ID card physics in `src/components/HangingIDCard.tsx`.

## 🎨 Customization

### Colors & Themes
Update Tailwind configuration in `tailwind.config.ts`.

### Animations
Modify CSS animations in component files or add new ones.

### Content
Update personal information in `src/data/lifeEvents.json`.

## 📊 Analytics Ready

The site is prepared for analytics integration with proper event tracking structure and SEO-friendly URLs.

## 🤝 Contributing

This is a personal resume project, but feedback and suggestions are welcome!

## 📄 License

Personal project - All rights reserved.

---

**Built with ❤️ by Kundan Ray**  
🌍 Kathmandu → Melbourne  
💼 Senior Full-Stack Engineer  
🤖 AI Integration Specialist
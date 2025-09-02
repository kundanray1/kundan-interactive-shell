import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API Configuration
const GEMINI_API_KEY = 'AIzaSyDQ0hHwvbzw3b-X-SAbcR_q5wNAQ_AySCU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Serve static files from current directory (when copied to dist) or dist directory (when in root)
const staticPath = fs.existsSync(path.join(__dirname, 'assets')) 
  ? __dirname 
  : path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// Rate limiting for API calls
const apiCallTimes = new Map();
const RATE_LIMIT_MS = 2000; // 2 seconds

function isRateLimited(clientId) {
  const lastCall = apiCallTimes.get(clientId);
  const now = Date.now();
  
  if (lastCall && (now - lastCall) < RATE_LIMIT_MS) {
    return true;
  }
  
  apiCallTimes.set(clientId, now);
  return false;
}

// Load life events data
let lifeEventsData = {};
try {
  const lifeEventsPath = path.join(__dirname, 'src', 'data', 'lifeEvents.json');
  lifeEventsData = JSON.parse(fs.readFileSync(lifeEventsPath, 'utf8'));
} catch (error) {
  console.warn('Could not load life events data:', error.message);
}

// API Endpoints
app.post('/api/chat-assistant', async (req, res) => {
  try {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting
    if (isRateLimited(clientId)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait before making another request.'
      });
    }

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request format - prompt required'
      });
    }

    // Create a detailed timeline context for better AI understanding
    const timelineContext = lifeEventsData.lifeEvents ? 
      lifeEventsData.lifeEvents
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(event => `${event.date}: ${event.title} - ${event.description} (Impact: ${event.impact}) [Tags: ${event.tags.join(', ')}]`)
        .join('\n')
      : 'No timeline data available';

    const personalTraitsContext = lifeEventsData.personalTraits ?
      lifeEventsData.personalTraits
        .map(trait => `${trait.trait}: ${trait.description}`)
        .join('\n')
      : '';

    const skillsContext = lifeEventsData.skills ?
      Object.entries(lifeEventsData.skills)
        .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
        .join('\n')
      : '';

    // Construct full Gemini API request with enhanced context
    const enhancedContents = [{
      parts: [{
        text: `You are Kundan Ray's AI assistant integrated into his interactive resume terminal. You have deep knowledge of his life journey, personality, and professional development.

=== PERSONAL INFO ===
Name: ${lifeEventsData.personalInfo?.name || 'Kundan Ray'}
Title: ${lifeEventsData.personalInfo?.title || 'Senior Full-Stack Engineer'}
Location: ${lifeEventsData.personalInfo?.location || 'Kathmandu, Nepal → Melbourne, Australia'}
Email: ${lifeEventsData.personalInfo?.email || 'raykundan57@gmail.com'}

=== PERSONALITY TRAITS ===
${personalTraitsContext}

=== TECHNICAL SKILLS ===
${skillsContext}

=== CHRONOLOGICAL LIFE TIMELINE ===
${timelineContext}

=== ACHIEVEMENTS ===
${lifeEventsData.achievements ? lifeEventsData.achievements.join('\n') : 'No achievements data'}

=== PROJECTS ===
${lifeEventsData.projects ? lifeEventsData.projects.map(p => `${p.name}: ${p.description} (Tech: ${p.tech.join(', ')}) - ${p.status}`).join('\n') : 'No projects data'}

=== USER QUESTION/COMMAND ===
${prompt}

=== INSTRUCTIONS ===
Please respond naturally and helpfully based on this comprehensive context. You understand Kundan's journey from childhood in rural Nepal to becoming a senior engineer, his experiences with teaching, startup founding, health tech work, and his upcoming move to Melbourne. Use specific details from the timeline when relevant. If users ask about terminal commands, respond appropriately for a terminal interface while staying in character as Kundan's AI assistant.`
      }]
    }];

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KundanRay-Resume-Server/1.0',
      },
      timeout: 30000, // 30 second timeout
      body: JSON.stringify({
        contents: enhancedContents,
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = 'AI service temporarily unavailable. Please try basic commands like "help", "skills", or "projects" for information about Kundan Ray.';
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      errorMessage = 'Connection timeout to AI service. Please try again in a moment or use commands like "help", "skills", or "projects".';
    } else if (error.message?.includes('API error')) {
      errorMessage = 'AI service error. Please try again or use basic commands like "help", "skills", or "projects".';
    }
    
    // Fallback response
    res.json({
      candidates: [{
        content: {
          parts: [{
            text: errorMessage
          }]
        }
      }]
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Kundan Ray Resume Server',
    version: '1.0.0'
  });
});

// SEO and Meta Tags for SPA
const generateHTML = (req) => {
  const baseTitle = "Kundan Ray - Senior Full-Stack Engineer | AI Integration Specialist";
  const baseDescription = "Senior Full-Stack Engineer from Nepal specializing in React, TypeScript, Node.js, and AI integration. Moving to Melbourne, Australia. Explore my interactive terminal resume.";
  const baseKeywords = "Kundan Ray, Full Stack Engineer, React Developer, TypeScript, Node.js, AI Integration, Nepal, Melbourne, Software Engineer, Terminal Resume";
  
  // Route-specific meta data
  const routes = {
    '/': {
      title: baseTitle,
      description: baseDescription,
      keywords: baseKeywords
    },
    '/about': {
      title: "About Kundan Ray - Senior Full-Stack Engineer",
      description: "Learn about Kundan Ray's journey from Nepal to Melbourne, his expertise in modern web technologies, and passion for AI integration.",
      keywords: `${baseKeywords}, About Kundan Ray, Biography, Career Journey`
    },
    '/skills': {
      title: "Technical Skills - Kundan Ray | React, TypeScript, AI",
      description: "Explore Kundan Ray's technical expertise: React, TypeScript, Node.js, Python, AI/ML integration, cloud technologies, and modern development practices.",
      keywords: `${baseKeywords}, Technical Skills, React, TypeScript, AI ML, Python, Cloud Computing`
    },
    '/projects': {
      title: "Projects & Work - Kundan Ray | Portfolio",
      description: "Discover Kundan Ray's projects including Provocative (cloud platform), MetricWire (health data), MarchUp (ADHD app), and more innovative solutions.",
      keywords: `${baseKeywords}, Projects, Portfolio, Cloud Platform, Health Tech, Mobile Apps`
    },
    '/experience': {
      title: "Professional Experience - Kundan Ray | Career Timeline",
      description: "Explore Kundan Ray's professional journey from teaching to senior engineering roles, startup co-founder, and AI integration specialist.",
      keywords: `${baseKeywords}, Work Experience, Career, Startup Founder, Teaching, Engineering`
    },
    '/contact': {
      title: "Contact Kundan Ray - Hire Full-Stack Engineer",
      description: "Get in touch with Kundan Ray for remote opportunities, consulting, or collaboration. Available for full-stack development and AI integration projects.",
      keywords: `${baseKeywords}, Contact, Hire, Remote Work, Consulting, Collaboration`
    }
  };

  const route = routes[req.path] || routes['/'];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO Meta Tags -->
  <title>${route.title}</title>
  <meta name="description" content="${route.description}" />
  <meta name="keywords" content="${route.keywords}" />
  <meta name="author" content="Kundan Ray" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://kundanray.com.np${req.path}" />
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:url" content="https://kundanray.com.np${req.path}" />
  <meta property="og:site_name" content="Kundan Ray - Interactive Resume" />
  <meta property="og:image" content="https://kundanray.com.np/IMG_2298.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Kundan Ray - Senior Full-Stack Engineer" />
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <meta name="twitter:image" content="https://kundanray.com.np/IMG_2298.webp" />
  <meta name="twitter:creator" content="@kundanray" />
  
  <!-- Additional SEO -->
  <meta name="geo.region" content="NP-BAG" />
  <meta name="geo.placename" content="Kathmandu, Nepal" />
  <meta name="geo.position" content="27.7172;85.3240" />
  <meta name="ICBM" content="27.7172, 85.3240" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kundan Ray",
    "jobTitle": "Senior Full-Stack Engineer",
    "description": "${route.description}",
    "url": "https://kundanray.com.np",
    "image": "https://kundanray.com.np/IMG_2298.webp",
    "email": "raykundan57@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kathmandu",
      "addressCountry": "Nepal"
    },
    "knowsAbout": [
      "React",
      "TypeScript", 
      "Node.js",
      "Python",
      "AI Integration",
      "Full-Stack Development",
      "Cloud Computing"
    ],
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Tribhuvan University - Institute of Engineering"
    },
    "sameAs": [
      "https://linkedin.com/in/er-kundan-ray-b432a412a",
      "https://github.com/kundanray1"
    ]
  }
  </script>
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/IMG_2298.webp" />
  
  <!-- Performance & Security -->
  <meta name="theme-color" content="#000000" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no" />
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
};

// Serve SPA with proper SEO
app.get('*', (req, res) => {
  // For API routes, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the SPA with SEO-optimized HTML
  res.send(generateHTML(req));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kundan Ray Resume Server running on port ${PORT}`);
  console.log(`🌍 Server ready at http://localhost:${PORT}`);
  console.log(`🤖 AI Chat API available at /api/chat-assistant`);
  console.log(`🏥 Health check at /api/health`);
});

export default app;
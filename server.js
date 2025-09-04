import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Visitor Analytics Configuration
const ANALYTICS_DIR = path.join(__dirname, 'analytics');
const VISITOR_LOG_FILE = path.join(ANALYTICS_DIR, 'visitors.json');
const DAILY_STATS_FILE = path.join(ANALYTICS_DIR, 'daily-stats.json');
const DATA_RETENTION_DAYS = 90; // Keep data for 90 days

// Ensure analytics directory exists
if (!fs.existsSync(ANALYTICS_DIR)) {
  fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
}

// Initialize visitor data files if they don't exist
if (!fs.existsSync(VISITOR_LOG_FILE)) {
  fs.writeFileSync(VISITOR_LOG_FILE, JSON.stringify({ visitors: [], lastUpdated: new Date().toISOString() }));
}

if (!fs.existsSync(DAILY_STATS_FILE)) {
  fs.writeFileSync(DAILY_STATS_FILE, JSON.stringify({ dailyStats: {}, lastUpdated: new Date().toISOString() }));
}

// API Configuration
const GEMINI_API_KEY = 'AIzaSyDQ0hHwvbzw3b-X-SAbcR_q5wNAQ_AySCU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Visitor logging middleware
app.use((req, res, next) => {
  // Skip logging for static assets and API health checks
  if (req.path.startsWith('/assets/') || 
      req.path.startsWith('/api/health') ||
      req.path.includes('.')) {
    return next();
  }
  
  // Log visitor data
  logVisitor(req);
  next();
});
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

// Visitor Analytics Functions
function generateVisitorId(ip, userAgent) {
  const combined = `${ip}-${userAgent}`;
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  const browser = ua.includes('Chrome') ? 'Chrome' : 
                  ua.includes('Firefox') ? 'Firefox' : 
                  ua.includes('Safari') ? 'Safari' : 
                  ua.includes('Edge') ? 'Edge' : 'Other';
  
  const os = ua.includes('Windows') ? 'Windows' : 
             ua.includes('Mac') ? 'macOS' : 
             ua.includes('Linux') ? 'Linux' : 
             ua.includes('Android') ? 'Android' : 
             ua.includes('iOS') ? 'iOS' : 'Other';
  
  const device = ua.includes('Mobile') ? 'Mobile' : 
                 ua.includes('Tablet') ? 'Tablet' : 'Desktop';
  
  return { browser, os, device };
}

function getLocationFromIP(ip) {
  // For production, you might want to use a service like ipapi.co or ipinfo.io
  // For now, we'll return basic info
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return { country: 'Local', city: 'Local', region: 'Local' };
  }
  
  // Extract basic info from IP (this is simplified - in production use a proper service)
  return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
}

function logVisitor(req) {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || '';
    const referer = req.get('Referer') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';
    
    const visitorId = generateVisitorId(ip, userAgent);
    const { browser, os, device } = parseUserAgent(userAgent);
    const location = getLocationFromIP(ip);
    
    const visitorData = {
      id: visitorId,
      timestamp: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      browser: browser,
      os: os,
      device: device,
      location: location,
      referer: referer,
      acceptLanguage: acceptLanguage,
      acceptEncoding: acceptEncoding,
      path: req.path,
      method: req.method,
      query: req.query,
      headers: {
        'x-forwarded-for': req.get('X-Forwarded-For'),
        'x-real-ip': req.get('X-Real-IP'),
        'cf-connecting-ip': req.get('CF-Connecting-IP'),
        'x-forwarded-proto': req.get('X-Forwarded-Proto'),
        'host': req.get('Host')
      }
    };
    
    // Read current visitor data
    const visitorLogData = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE, 'utf8'));
    
    // Check if this is a new visitor or returning visitor
    const existingVisitor = visitorLogData.visitors.find(v => v.id === visitorId);
    
    if (existingVisitor) {
      // Update existing visitor
      existingVisitor.lastVisit = new Date().toISOString();
      existingVisitor.visitCount = (existingVisitor.visitCount || 1) + 1;
      existingVisitor.lastPath = req.path;
      existingVisitor.lastUserAgent = userAgent;
    } else {
      // Add new visitor
      visitorData.firstVisit = new Date().toISOString();
      visitorData.visitCount = 1;
      visitorLogData.visitors.push(visitorData);
    }
    
    // Update last updated timestamp
    visitorLogData.lastUpdated = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(VISITOR_LOG_FILE, JSON.stringify(visitorLogData, null, 2));
    
    // Update daily stats
    updateDailyStats(visitorData);
    
  } catch (error) {
    console.error('Error logging visitor:', error);
  }
}

function updateDailyStats(visitorData) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyStatsData = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf8'));
    
    if (!dailyStatsData.dailyStats[today]) {
      dailyStatsData.dailyStats[today] = {
        date: today,
        totalVisits: 0,
        uniqueVisitors: 0,
        browsers: {},
        os: {},
        devices: {},
        countries: {},
        paths: {},
        referers: {}
      };
    }
    
    const dayStats = dailyStatsData.dailyStats[today];
    dayStats.totalVisits++;
    
    // Count unique visitors (simplified - in production you'd want more sophisticated tracking)
    if (!dayStats.uniqueVisitors) dayStats.uniqueVisitors = 0;
    dayStats.uniqueVisitors++;
    
    // Count browsers
    dayStats.browsers[visitorData.browser] = (dayStats.browsers[visitorData.browser] || 0) + 1;
    
    // Count OS
    dayStats.os[visitorData.os] = (dayStats.os[visitorData.os] || 0) + 1;
    
    // Count devices
    dayStats.devices[visitorData.device] = (dayStats.devices[visitorData.device] || 0) + 1;
    
    // Count countries
    dayStats.countries[visitorData.location.country] = (dayStats.countries[visitorData.location.country] || 0) + 1;
    
    // Count paths
    dayStats.paths[visitorData.path] = (dayStats.paths[visitorData.path] || 0) + 1;
    
    // Count referers
    const referer = visitorData.referer || 'Direct';
    dayStats.referers[referer] = (dayStats.referers[referer] || 0) + 1;
    
    dailyStatsData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DAILY_STATS_FILE, JSON.stringify(dailyStatsData, null, 2));
    
  } catch (error) {
    console.error('Error updating daily stats:', error);
  }
}

function cleanupOldData() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
    
    // Clean up visitor data
    const visitorLogData = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE, 'utf8'));
    visitorLogData.visitors = visitorLogData.visitors.filter(visitor => {
      const visitDate = new Date(visitor.timestamp || visitor.firstVisit);
      return visitDate > cutoffDate;
    });
    fs.writeFileSync(VISITOR_LOG_FILE, JSON.stringify(visitorLogData, null, 2));
    
    // Clean up daily stats
    const dailyStatsData = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf8'));
    Object.keys(dailyStatsData.dailyStats).forEach(date => {
      if (new Date(date) < cutoffDate) {
        delete dailyStatsData.dailyStats[date];
      }
    });
    fs.writeFileSync(DAILY_STATS_FILE, JSON.stringify(dailyStatsData, null, 2));
    
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}

// Run cleanup on startup
cleanupOldData();

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

// Analytics endpoints
app.get('/api/analytics/visitors', (req, res) => {
  try {
    const visitorLogData = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE, 'utf8'));
    
    // Return summary data (not full visitor details for privacy)
    const summary = {
      totalVisitors: visitorLogData.visitors.length,
      lastUpdated: visitorLogData.lastUpdated,
      recentVisitors: visitorLogData.visitors
        .sort((a, b) => new Date(b.timestamp || b.lastVisit) - new Date(a.timestamp || a.firstVisit))
        .slice(0, 50)
        .map(visitor => ({
          id: visitor.id,
          firstVisit: visitor.firstVisit,
          lastVisit: visitor.lastVisit,
          visitCount: visitor.visitCount,
          browser: visitor.browser,
          os: visitor.os,
          device: visitor.device,
          location: visitor.location,
          lastPath: visitor.lastPath
        }))
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching visitor data:', error);
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

app.get('/api/analytics/daily-stats', (req, res) => {
  try {
    const dailyStatsData = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf8'));
    
    // Get last 30 days of stats
    const last30Days = {};
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dailyStatsData.dailyStats[dateStr]) {
        last30Days[dateStr] = dailyStatsData.dailyStats[dateStr];
      }
    }
    
    res.json({
      last30Days,
      lastUpdated: dailyStatsData.lastUpdated
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

app.get('/api/analytics/summary', (req, res) => {
  try {
    const visitorLogData = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE, 'utf8'));
    const dailyStatsData = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf8'));
    
    // Calculate summary statistics
    const totalVisitors = visitorLogData.visitors.length;
    const totalVisits = visitorLogData.visitors.reduce((sum, visitor) => sum + (visitor.visitCount || 1), 0);
    
    // Browser distribution
    const browserStats = {};
    const osStats = {};
    const deviceStats = {};
    const countryStats = {};
    
    visitorLogData.visitors.forEach(visitor => {
      browserStats[visitor.browser] = (browserStats[visitor.browser] || 0) + 1;
      osStats[visitor.os] = (osStats[visitor.os] || 0) + 1;
      deviceStats[visitor.device] = (deviceStats[visitor.device] || 0) + 1;
      countryStats[visitor.location.country] = (countryStats[visitor.location.country] || 0) + 1;
    });
    
    // Recent activity (last 7 days)
    const last7Days = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dailyStatsData.dailyStats[dateStr]) {
        last7Days[dateStr] = dailyStatsData.dailyStats[dateStr];
      }
    }
    
    const summary = {
      overview: {
        totalVisitors,
        totalVisits,
        averageVisitsPerVisitor: totalVisitors > 0 ? (totalVisits / totalVisitors).toFixed(2) : 0,
        lastUpdated: visitorLogData.lastUpdated
      },
      distribution: {
        browsers: browserStats,
        operatingSystems: osStats,
        devices: deviceStats,
        countries: countryStats
      },
      recentActivity: last7Days
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    res.status(500).json({ error: 'Failed to generate analytics summary' });
  }
});

// Admin endpoint to export all data (for backup purposes)
app.get('/api/analytics/export', (req, res) => {
  try {
    const visitorLogData = JSON.parse(fs.readFileSync(VISITOR_LOG_FILE, 'utf8'));
    const dailyStatsData = JSON.parse(fs.readFileSync(DAILY_STATS_FILE, 'utf8'));
    
    const exportData = {
      exportDate: new Date().toISOString(),
      visitors: visitorLogData,
      dailyStats: dailyStatsData,
      metadata: {
        dataRetentionDays: DATA_RETENTION_DAYS,
        totalVisitors: visitorLogData.visitors.length,
        exportVersion: '1.0'
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
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
  console.log(`📊 Analytics endpoints:`);
  console.log(`   - /api/analytics/summary - Overview statistics`);
  console.log(`   - /api/analytics/visitors - Visitor details`);
  console.log(`   - /api/analytics/daily-stats - Daily statistics`);
  console.log(`   - /api/analytics/export - Export all data`);
  console.log(`📁 Analytics data stored in: ${ANALYTICS_DIR}`);
  console.log(`🗑️  Data retention: ${DATA_RETENTION_DAYS} days`);
});

export default app;
// Simple rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

// Google AI Studio (Gemini) API integration  
export async function getAIResponse(question: string, context: unknown) {
  // Rate limiting
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return 'Please wait a moment before making another request...';
  }
  lastRequestTime = now;
  
  try {
    // Make the API request through our Node.js server - only send the prompt
    const res = await fetch('/api/chat-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: question
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response from AI.';
  } catch (err) {
    console.error('AI API Error:', err);
    
    // Fallback responses based on question content
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('about') || questionLower.includes('who')) {
      return 'I\'m Kundan Ray, a Senior Full-Stack Engineer from Nepal moving to Melbourne. I specialize in React, TypeScript, Node.js, and AI integration. Try "open about" for more details.';
    }
    
    if (questionLower.includes('skill') || questionLower.includes('tech')) {
      return 'I work with React, TypeScript, Node.js, Python, and various cloud technologies. I\'ve also integrated AI/ML into production apps. Use "skills" command to see the full list.';
    }
    
    if (questionLower.includes('project') || questionLower.includes('work')) {
      return 'I\'ve built projects like Provocative (cloud platform), MetricWire (health data), and MarchUp (ADHD student app). Try "projects" command for details.';
    }
    
    if (questionLower.includes('contact') || questionLower.includes('hire')) {
      return 'You can reach me at raykundan57@gmail.com or visit kundanray.com.np. I\'m open to remote opportunities. Use "contact" for full details.';
    }
    
    return 'AI service temporarily unavailable. Try commands like "help", "skills", "projects", or "life-events" for information.';
  }
}

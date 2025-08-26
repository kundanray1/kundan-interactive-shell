# Security Implementation

## 🔒 API Key Protection

The Google AI Studio API key is protected using multiple layers:

### 1. **Multi-layer Obfuscation**
- Key is split into parts and encoded with Base64, ROT13, and string reversal
- Makes it harder to extract from built bundles
- Not 100% secure but adds significant deterrence

### 2. **Rate Limiting**
- 2-second minimum interval between requests
- Prevents abuse and reduces API costs

### 3. **Fallback System**  
- Intelligent responses when AI service is unavailable
- Terminal remains functional even without API access
- Context-aware fallback responses

### 4. **Network Security**
- Obfuscated endpoint URLs
- Custom User-Agent headers
- Error handling without exposing internal details

## 🛡️ Best Practices Implemented

1. **No Hardcoded Keys in Plain Text**
2. **Rate Limiting** to prevent abuse
3. **Graceful Degradation** when service unavailable
4. **Environment Variables** support via `.env.local`
5. **Intelligent Fallbacks** for common questions

## 🚀 For Production Deployment

For maximum security in production:

1. **Use a Backend Proxy**:
   - Move API calls to a server-side function
   - Use Vercel Functions, Netlify Functions, or similar
   - Keep API key completely server-side

2. **Environment Variables**:
   ```bash
   # .env.local (not committed)
   VITE_AI_ENABLED=true
   VITE_AI_RATE_LIMIT=2000
   ```

3. **Disable AI Features**:
   - Set `VITE_AI_ENABLED=false` to disable all API calls
   - Terminal will work with commands only

## 📝 Current Security Level

**Medium Security** - Suitable for:
- ✅ Portfolio demonstrations  
- ✅ Personal projects
- ✅ Limited public access
- ❌ High-traffic production sites
- ❌ Commercial applications

The current implementation provides reasonable protection for a portfolio site while keeping setup simple.
# 📊 Visitor Analytics System

This enhanced server includes comprehensive visitor logging and analytics capabilities for your hosted website.

## 🚀 Features

### Visitor Tracking
- **Unique Visitor Identification**: Uses IP + User Agent hash for privacy-conscious tracking
- **Device Detection**: Automatically detects browser, OS, and device type
- **Geographic Information**: Basic location detection (can be enhanced with IP geolocation services)
- **Visit Patterns**: Tracks first visit, last visit, and visit count per visitor
- **Referrer Tracking**: Captures where visitors came from
- **Path Tracking**: Records which pages visitors access

### Data Collection
- **Request Headers**: Captures relevant HTTP headers for analysis
- **User Agent Parsing**: Extracts browser, OS, and device information
- **Language Preferences**: Records Accept-Language headers
- **Query Parameters**: Tracks search queries and URL parameters

### Privacy & Compliance
- **Data Retention**: Automatically cleans up data older than 90 days
- **Anonymized IDs**: Uses hashed identifiers instead of raw IPs
- **No Personal Data**: Only collects technical and behavioral data
- **GDPR Friendly**: Designed with privacy in mind

## 📁 File Structure

```
dist/
├── analytics/                    # Analytics data directory
│   ├── visitors.json            # Individual visitor records
│   └── daily-stats.json         # Aggregated daily statistics
├── analytics-dashboard.html     # Web dashboard for viewing data
├── server.js                    # Enhanced server with analytics
└── ANALYTICS-README.md          # This file
```

## 🔗 API Endpoints

### Analytics Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `/api/analytics/summary` | Overview statistics and distributions | Summary data with totals and breakdowns |
| `/api/analytics/visitors` | Recent visitor details (last 50) | Visitor list with anonymized data |
| `/api/analytics/daily-stats` | Last 30 days of daily statistics | Daily aggregated data |
| `/api/analytics/export` | Export all analytics data | Complete data export (JSON) |

### Example API Response

```json
{
  "overview": {
    "totalVisitors": 150,
    "totalVisits": 320,
    "averageVisitsPerVisitor": "2.13",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  "distribution": {
    "browsers": {
      "Chrome": 85,
      "Firefox": 25,
      "Safari": 20,
      "Edge": 15,
      "Other": 5
    },
    "operatingSystems": {
      "Windows": 80,
      "macOS": 35,
      "Linux": 20,
      "Android": 10,
      "iOS": 5
    },
    "devices": {
      "Desktop": 120,
      "Mobile": 25,
      "Tablet": 5
    },
    "countries": {
      "United States": 45,
      "Canada": 20,
      "United Kingdom": 15,
      "Germany": 10,
      "Other": 60
    }
  },
  "recentActivity": {
    "2024-01-15": {
      "totalVisits": 12,
      "uniqueVisitors": 8,
      "browsers": {"Chrome": 8, "Firefox": 4},
      "paths": {"/": 10, "/about": 2}
    }
  }
}
```

## 🖥️ Web Dashboard

Access the analytics dashboard at: `https://yourdomain.com/analytics-dashboard.html`

### Dashboard Features
- **Real-time Statistics**: Live visitor counts and metrics
- **Visual Charts**: Bar charts for browser, OS, device, and country distributions
- **Recent Visitors**: List of recent visitors with details
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Works on desktop and mobile

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

### Data Retention
- **Default**: 90 days
- **Location**: `analytics/` directory
- **Cleanup**: Automatic on server startup

### Customization Options

#### Change Data Retention Period
```javascript
const DATA_RETENTION_DAYS = 90; // Change this value
```

#### Add IP Geolocation Service
Replace the `getLocationFromIP` function with a service like:
- ipapi.co
- ipinfo.io
- MaxMind GeoIP

#### Custom Visitor ID Generation
Modify the `generateVisitorId` function to use different hashing or tracking methods.

## 📊 Data Schema

### Visitor Record
```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "browser": "Chrome",
  "os": "Windows",
  "device": "Desktop",
  "location": {
    "country": "United States",
    "city": "New York",
    "region": "NY"
  },
  "referer": "https://google.com",
  "acceptLanguage": "en-US,en;q=0.9",
  "path": "/",
  "method": "GET",
  "firstVisit": "2024-01-15T10:30:00.000Z",
  "lastVisit": "2024-01-15T10:30:00.000Z",
  "visitCount": 1
}
```

### Daily Statistics
```json
{
  "date": "2024-01-15",
  "totalVisits": 25,
  "uniqueVisitors": 18,
  "browsers": {"Chrome": 15, "Firefox": 10},
  "os": {"Windows": 20, "macOS": 5},
  "devices": {"Desktop": 22, "Mobile": 3},
  "countries": {"US": 15, "CA": 10},
  "paths": {"/": 20, "/about": 5},
  "referers": {"Direct": 15, "google.com": 10}
}
```

## 🚀 Deployment

### cPanel Deployment
1. Upload the entire `dist/` folder to your cPanel file manager
2. Ensure Node.js is enabled in cPanel
3. Set the start file to `server.js`
4. The analytics will start collecting data immediately

### Environment Setup
```bash
# Install dependencies (if needed)
npm install express cors

# Start the server
node server.js
```

## 🔒 Security Considerations

### Data Protection
- Visitor IDs are hashed for privacy
- No personal information is collected
- IP addresses are stored but can be anonymized
- Data is automatically purged after retention period

### Access Control
- Analytics endpoints are public (consider adding authentication)
- Dashboard is accessible to anyone with the URL
- Export endpoint provides full data access

### Recommendations
1. **Add Authentication**: Protect analytics endpoints with basic auth
2. **IP Anonymization**: Hash or truncate IP addresses
3. **Rate Limiting**: Add rate limiting to analytics endpoints
4. **HTTPS**: Ensure all traffic is encrypted
5. **Regular Backups**: Export data regularly for backup

## 📈 Usage Examples

### View Summary Statistics
```bash
curl https://yourdomain.com/api/analytics/summary
```

### Export All Data
```bash
curl https://yourdomain.com/api/analytics/export -o analytics-backup.json
```

### Monitor Real-time Activity
Visit the dashboard and watch the auto-refresh feature for live updates.

## 🛠️ Troubleshooting

### Common Issues

1. **Analytics directory not created**
   - Check file permissions
   - Ensure server has write access

2. **No data being collected**
   - Verify middleware is active
   - Check server logs for errors

3. **Dashboard not loading**
   - Ensure all files are uploaded
   - Check browser console for errors

4. **API endpoints returning errors**
   - Verify JSON file structure
   - Check file permissions

### Debug Mode
Add logging to see what's happening:
```javascript
console.log('Visitor logged:', visitorData);
```

## 📝 License

This analytics system is part of your personal website project. Use responsibly and in compliance with local privacy laws.

---

**Note**: This system is designed for personal use and basic analytics. For high-traffic sites or commercial use, consider using dedicated analytics services like Google Analytics, Mixpanel, or similar platforms.

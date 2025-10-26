# Cyber Threat Intelligence Platform

A comprehensive cyber threat intelligence platform with AI-powered threat detection, blockchain verification, real-time alerts, and MITRE ATT&CK framework integration.

## Features

- 🛡️ **Threat Reporting & Tracking** - Submit and track cyber threats with detailed information
- 🤖 **AI-Powered Analysis** - Automated threat classification using machine learning
- 🔗 **Blockchain Logging** - Immutable threat records on blockchain
- 🌍 **Global Threat Map** - Real-time geographic threat visualization
- 🔍 **Phishing Detection** - URL and email analysis for phishing attempts
- 🦠 **Malware Scanning** - VirusTotal integration and static analysis
- 📊 **MITRE ATT&CK Mapping** - Threat categorization using MITRE framework
- 💬 **AI Chatbot** - Interactive cybersecurity assistance
- 🔔 **Real-time Alerts** - WebSocket-powered instant notifications
- 👨‍💼 **Admin Panel** - Threat moderation and user management
- 🖼️ **Computer Vision** - Screenshot analysis for threat detection

## Tech Stack

### Backend
- FastAPI (Python)
- MongoDB (Database)
- Motor (Async MongoDB driver)
- JWT Authentication
- WebSockets
- TensorFlow/Scikit-learn (ML)
- OpenCV (Computer Vision)
- Web3.py (Blockchain)
- VirusTotal API

### Frontend
- React 18
- React Router
- Axios
- Tailwind CSS
- Lucide Icons
- WebSocket Client

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB
- (Optional) Ethereum node for blockchain features

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env file:
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws

# Start development server
npm start
```

The app will be available at `http://localhost:3000`

## Configuration

### MongoDB
Update `MONGO_URL` in `.env`:
```
MONGO_URL=mongodb://localhost:27017
```

### VirusTotal API
Get API key from [VirusTotal](https://www.virustotal.com/) and add to `.env`:
```
VIRUSTOTAL_API_KEY=your_api_key_here
```

### Blockchain (Optional)
For blockchain features, configure:
```
WEB3_PROVIDER=http://127.0.0.1:8545
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_private_key
```

Deploy the smart contract:
```bash
# Using Hardhat or Truffle
cd backend/smart_contract
# Deploy ThreatLogger.sol
```

## Usage

### 1. Register/Login
Create an account or login at `/register` or `/login`

### 2. Report Threats
- Navigate to "Report Threat"
- Fill in threat details (title, description, type, severity)
- Add MITRE ATT&CK technique ID
- Include indicators of compromise (IPs, domains, hashes)
- Add location data (optional)
- Submit for AI analysis

### 3. View Dashboard
- **User Dashboard**: Personal stats and recent threats
- **Global Dashboard**: Worldwide threat distribution and MITRE mapping
- **Threat Timeline**: 30-day threat trends

### 4. Scan for Threats
- **Phishing Scanner**: Check URLs and emails for phishing
- **Malware Scanner**: Upload files for VirusTotal analysis

### 5. AI Chatbot
- Click chatbot icon (bottom right)
- Ask about malware, phishing, MITRE ATT&CK, etc.
- Get instant cybersecurity guidance

### 6. Admin Features (Admin Only)
- Moderate pending threat reports
- Manage users (activate/deactivate)
- View system statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Threats
- `POST /api/threats/report` - Report new threat
- `GET /api/threats` - Get all threats
- `GET /api/threats/{id}` - Get specific threat
- `PATCH /api/threats/{id}` - Update threat
- `DELETE /api/threats/{id}` - Delete threat

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/timeline` - Get threat timeline
- `GET /api/dashboard/mitre-mapping` - Get MITRE techniques
- `GET /api/dashboard/threat-map` - Get geographic data

### Scanning
- `POST /api/phishing/scan-url` - Scan URL for phishing
- `POST /api/phishing/scan-email` - Scan email for phishing
- `POST /api/malware/scan-file` - Scan file for malware
- `POST /api/malware/scan-url` - Scan URL for malware

### Admin
- `GET /api/admin/threats/pending` - Get pending threats
- `PATCH /api/admin/threats/{id}/moderate` - Moderate threat
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/{id}/moderate` - Moderate user

## Using the Swagger UI (Authorize)

The project exposes interactive API docs at `http://localhost:8000/docs` (Swagger UI). Several endpoints require JWT bearer authentication. To call protected endpoints from the docs:

1. Use the `POST /api/auth/login` endpoint in the docs to obtain a token (the response includes `token`).
2. Click the green "Authorize" button in the top-right of the Swagger UI.
3. In the modal, paste the token prefixed with `Bearer ` (for example: `Bearer eyJhbGciOiJIUzI1NiI...`) and click **Authorize**.
4. Close the modal and call protected endpoints — Swagger will send the `Authorization: Bearer <token>` header automatically.

If you prefer, you can also paste the raw token (without `Bearer `) in some setups, but including the `Bearer ` prefix ensures the header format matches the backend's HTTPBearer requirement.

## MITRE ATT&CK Integration

The platform maps threats to MITRE ATT&CK techniques:

- **T1566**: Phishing
- **T1059**: Command and Scripting Interpreter
- **T1486**: Data Encrypted for Impact (Ransomware)
- **T1498/T1499**: Network/Endpoint DoS
- **T1567**: Exfiltration Over Web Service

Add technique IDs when reporting threats for better categorization.

## Security Considerations

- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Input validation on all endpoints
- CORS configured for specific origins
- File upload size limits enforced
- Rate limiting on API endpoints
- WebSocket authentication required

## Development

### Adding New Features

1. **Backend**: Add router in `backend/routers/`
2. **Frontend**: Add component in `frontend/src/components/`
3. **Models**: Define in `backend/models/`
4. **Services**: Add API calls in `frontend/src/services/`

### Running Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Deployment

### Docker (Recommended)

```bash
# Build and run
docker-compose up -d
```

### Manual Deployment

1. Set production environment variables
2. Build frontend: `npm run build`
3. Serve frontend with nginx
4. Run backend with gunicorn/uvicorn
5. Set up MongoDB with authentication
6. Configure firewall rules

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file

## Support

For issues or questions:
- Open GitHub issue
- Contact: support@cyberthreatintel.com

## Acknowledgments

- MITRE ATT&CK Framework
- VirusTotal API
- FastAPI Framework
- React Community

# KisanKhata — Technology Stack Documentation

## 1. Stack Overview
**Last Updated**: April 2026  
**Version**: 2.0 (Hackathon Optimized)

### Architecture Pattern
- **Type**: Modular Monolith  
- **Pattern**: API-First  
- **Deployment**: Cloud (Vercel + Render)

---

## 2. Frontend Stack

### Core Framework
- **Framework**: React (Vite)
- **Version**: 18.x
- **Reason**: Fast development, minimal setup
- **Documentation**: https://react.dev
- **License**: MIT

### State Management
- **Library**: Zustand
- **Version**: 4.x
- **Reason**: Lightweight, minimal boilerplate
- **Alternatives Considered**: Redux (too heavy)

### Styling
- **Framework**: Tailwind CSS
- **Version**: 3.x
- **Reason**: Rapid UI development

### Type Safety
- **Language**: TypeScript
- **Reason**: Fewer runtime errors

### Form Handling
- **Library**: React Hook Form
- **Reason**: Performance and simplicity

### HTTP Client
- **Library**: Axios
- **Reason**: Interceptors and better error handling

---

## 3. Backend Stack

### Runtime
- **Language**: Python 3.12
- **Reason**: ML compatibility

### Framework
- **Framework**: FastAPI
- **Reason**: High performance, auto docs

### Server
- **Server**: Uvicorn

### Database
- **Primary**: SQLite (Hackathon)
- **Optional**: PostgreSQL

### ORM
- **Library**: SQLAlchemy

---

## 4. ML / AI Stack

### Models
- **XGBoost**: Primary scoring model
- **RandomForest**: Secondary ensemble model

### Ensemble Strategy
Final Score = 0.7 * XGBoost + 0.3 * RandomForest

### Explainability
- **SHAP**: Global feature importance
- **LIME**: Local explanations

### Features Used
- Land Area
- Crop Type
- Weather Data
- NDVI Proxy
- Mandi Prices

---

## 5. External APIs

### Core APIs (Free)
- NASA POWER API → Weather data
- OpenWeatherMap → Real-time weather
- AGMARKNET (data.gov.in) → Crop prices

### Optional APIs
- Sentinel Hub → NDVI
- Government APIs → Scheme data

---

## 6. DevOps & Infrastructure

### Hosting
- **Frontend**: Vercel
- **Backend**: Render / Railway
- **Database**: SQLite / PostgreSQL

### Version Control
- Git + GitHub

---

## 7. Development Tools

### Linter
- ESLint

### Formatter
- Prettier

### IDE
- VS Code

---

## 8. Environment Variables

```bash
DATABASE_URL="sqlite:///./test.db"
OPENWEATHER_API_KEY="..."
NASA_POWER_BASE_URL="..."
AGMARKNET_API_KEY="..."
```

---

## 9. Package Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "start": "uvicorn app:app",
  "test": "pytest"
}
```

---

## 10. Security Considerations

- JWT Authentication
- HTTPS in production
- Input validation via Pydantic
- Rate limiting (basic)

---

## 11. Version Upgrade Policy

### Updates
- Weekly dependency review
- Security patches prioritized

### Strategy
- Keep stack minimal for hackathon
- Scale after MVP

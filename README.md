# TRAVEL2030 - Plateforme de Planification de Voyages

![Travel2030](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen) ![Angular](https://img.shields.io/badge/Angular-17-red) ![Java](https://img.shields.io/badge/Java-17-orange) ![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

## 📋 Vue d'Ensemble

Travel2030 est une plateforme intelligente de planification de voyages avec une architecture full-stack moderne. L'application permet aux utilisateurs de planifier leurs voyages, découvrir des destinations, gérer des hébergements et partager leurs expériences avec une communauté de voyageurs.

### Architecture
- **Backend**: Spring Boot 3.2.0 (Java 17) - Port 8085
- **Frontend**: Angular 17 (Standalone Components) - Port 4200
- **Base de données**: MySQL 8.0 - Port 3306
- **Sécurité**: JWT avec HMAC-SHA512 + BCrypt

## 🚀 Démarrage Rapide

### Prérequis
- Java 17+
- Node.js 18+
- Maven 3.8+
- MySQL 8.0 (ou Docker)

### Option 1: Script Automatique (Recommandé)
```bash
./start.sh
```

### Option 2: Démarrage Manuel

#### 1. Base de Données (MySQL Local)
```bash
# Setup initial (première fois seulement)
./setup-local-mysql.sh

# OU manuellement:
mysql -u root -p < setup-local-mysql.sql
```

#### 2. Backend
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
cd backend
mvn spring-boot:run
```

#### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 URLs de l'Application

### Frontend
| Page | URL |
|------|-----|
| Accueil | http://localhost:4200 |
| Connexion | http://localhost:4200/login |
| Inscription | http://localhost:4200/register |
| Destinations | http://localhost:4200/destinations |
| Mes Voyages | http://localhost:4200/trips |

### Backend API
| Endpoint | Méthode | URL |
|----------|---------|-----|
| Health Check | GET | http://localhost:8085/api/health |
| Register | POST | http://localhost:8085/api/auth/register |
| Login | POST | http://localhost:8085/api/auth/login |
| Refresh Token | POST | http://localhost:8085/api/auth/refresh |

## 🧪 Test de l'API

### Inscription
```bash
curl -X POST http://localhost:8085/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123"
  }'
```

## ✨ Fonctionnalités

### ✅ Implémentées
- **Authentification JWT**
  - Inscription avec validation
  - Connexion sécurisée
  - Refresh token (7 jours)
  - Hachage BCrypt (strength 12)
  
- **Design System**
  - Style noir et blanc classique
  - Animations fluides (fadeInUp, slideInLeft, scaleIn)
  - Responsive design
  - Navigation élégante avec effets hover

- **Infrastructure**
  - Docker Compose (MySQL + phpMyAdmin)
  - Health checks
  - CORS configuré
  - Intercepteur HTTP JWT

### 🚧 En Développement
- Page des destinations avec carte Leaflet
- Gestion des voyages (CRUD)
- Hébergements et réservations
- Communauté (commentaires, likes)
- Recommandations personnalisées
- Espace administrateur

## 📁 Structure du Projet

```
fill rouge/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/
│   │   ├── config/            # SecurityConfig, CORS
│   │   ├── controller/        # AuthController, HealthController
│   │   ├── dto/              # RegisterRequest, LoginRequest, AuthResponse
│   │   ├── model/            # User, Role (USER, ADMIN, GUIDE)
│   │   ├── security/         # JwtService, JwtAuthFilter
│   │   └── service/          # AuthService, UserDetailsService
│   ├── src/main/resources/
│   │   └── application.yml   # Configuration (MySQL, JWT, CORS)
│   └── pom.xml               # Dependencies
│
├── frontend/                  # Angular Frontend
│   ├── src/app/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Register
│   │   │   └── home/        # HomePage avec Hero
│   │   ├── services/        # AuthService
│   │   ├── interceptors/    # AuthInterceptor
│   │   └── app.routes.ts    # Routing
│   └── src/styles.css       # Design System
│
├── docker-compose.yml        # MySQL + phpMyAdmin
├── start.sh                 # Script de démarrage
├── SETUP.md                 # Guide d'installation complet
├── SECURITY_GUIDE.md        # Documentation JWT
└── README.md                # Ce fichier
```

## 🎨 Design System

### Palette de Couleurs
```css
--primary-black: #000000
--primary-white: #ffffff
--gray-100 à --gray-900 (échelle de gris)
```

### Animations
- **fadeInUp**: Apparition progressive depuis le bas
- **slideInLeft**: Glissement depuis la gauche
- **scaleIn**: Zoom d'apparition
- **pulse**: Pulsation subtile

### Typographie
- **Titres**: Font-weight 700-800, letterspacing 2px, uppercase
- **Corps**: 1rem, line-height 1.6
- **Boutons**: Uppercase, font-weight 600

## 🔐 Sécurité

### Configuration JWT
- **Algorithme**: HMAC-SHA512
- **Secret**: 512-bit (configuré dans application.yml)
- **Access Token**: 24 heures
- **Refresh Token**: 7 jours
- **Hachage**: BCrypt (strength 12)

### Règles d'Accès
| Endpoint | Public | Authentifié | Admin |
|----------|--------|-------------|-------|
| /api/auth/** | ✅ | ✅ | ✅ |
| /api/health | ✅ | ✅ | ✅ |
| GET /api/destinations | ✅ | ✅ | ✅ |
| /api/trips/** | ❌ | ✅ | ✅ |
| POST/PUT/DELETE /api/destinations | ❌ | ❌ | ✅ |

## 📚 Documentation

### Guides Complets
- **[SETUP.md](SETUP.md)**: Guide d'installation avec 3 options de déploiement
- **[SECURITY_GUIDE.md](SECURITY_GUIDE.md)**: Documentation JWT complète (600+ lignes)

### Exemples de Code
Voir les guides pour:
- Exemples curl complets
- Collection Postman
- Gestion des erreurs 401/403
- Refresh token flow
- Best practices

## 🔧 Dépannage

### Backend ne démarre pas
```bash
# Vérifier Java 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
java -version

# Vérifier MySQL
docker-compose ps

# Logs
tail -f /tmp/travel2030-backend.log
```

### Frontend ne compile pas
```bash
# Nettoyer et réinstaller
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# Logs
tail -f /tmp/travel2030-frontend.log
```

### Erreur CORS
Vérifier `backend/src/main/resources/application.yml`:
```yaml
app:
  cors:
    allowed-origins: http://localhost:4200,http://localhost:3000
```

### JWT Invalide
1. Vérifier le token dans localStorage (F12 → Application)
2. Token expiré? Utiliser le refresh token
3. Consulter SECURITY_GUIDE.md

## 🛠️ Technologies

### Backend
- Spring Boot 3.2.0
- Spring Security 6.x
- Spring Data JPA
- JJWT 0.12.3
- MapStruct 1.5.5
- Lombok
- MySQL 8.0
- H2 (tests)

### Frontend
- Angular 17
- Standalone Components
- Reactive Forms
- RxJS
- TypeScript 5
- CSS3 (Variables, Animations)

### DevOps
- Docker Compose
- Maven
- npm
- Git

## 📊 Statistiques du Projet

- **Backend**: 39 fichiers Java compilés
- **Frontend**: 10+ composants Angular
- **Documentation**: 900+ lignes (SETUP.md + SECURITY_GUIDE.md)
- **API Endpoints**: 4 (auth), 4 (health)
- **Compilation**: BUILD SUCCESS (2.6s backend, 2.9s frontend)

## 🤝 Contribution

Ce projet fait partie d'un système de gestion de voyages. Pour contribuer:
1. Consulter SETUP.md pour l'environnement de dev
2. Suivre les conventions de code (Lombok, MapStruct)
3. Ajouter des tests unitaires
4. Documenter les nouveaux endpoints

## 📝 License

Ce projet est destiné à des fins éducatives et de démonstration.

---

**Travel2030** - Voyagez intelligemment avec style 🌍✈️

Pour plus d'informations, consulter:
- [Guide de Configuration](SETUP.md)
- [Guide de Sécurité JWT](SECURITY_GUIDE.md)

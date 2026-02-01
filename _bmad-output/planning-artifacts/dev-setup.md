---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'dev-setup'
date: '2026-02-01'
author: 'Madegun'
---

# Development Environment Setup Guide - ProdGantiNew

**Author:** Madegun  
**Date:** 2026-02-01  
**Version:** 1.0  
**Status:** Draft  
**Based on:** PRD (2026-01-31), TDD (2026-02-01), UI/UX Wireframes (2026-02-01)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-01 | Madegun | Initial setup guide creation |

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Development Tools Setup](#development-tools-setup)
4. [Database Setup](#database-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Docker Setup](#docker-setup)
8. [Verification Steps](#verification-steps)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose | Download URL |
|----------|---------|---------|--------------|
| Node.js | 20.x LTS | JavaScript runtime | https://nodejs.org |
| npm | 9.x+ | Package manager | Comes with Node.js |
| Git | 2.40+ | Version control | https://git-scm.com |
| PostgreSQL | 15.x | Production database | https://www.postgresql.org |
| MySQL | 8.0+ | Legacy database (gayafusionall) | https://www.mysql.com |
| Docker Desktop | 4.20+ | Containerization | https://www.docker.com |
| VS Code | Latest | Code editor | https://code.visualstudio.com |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "mtxr.sqltools",
    "ms-azuretools.vscode-docker",
    "github.vscode-github-actions",
    "eamodio.gitlens"
  ]
}
```

### System Requirements

**Minimum:**
- 8GB RAM
- 20GB free disk space
- Modern CPU (4 cores)
- Windows 10 / macOS 10.15 / Ubuntu 20.04

**Recommended:**
- 16GB RAM
- 50GB free disk space
- Modern CPU (8 cores)
- SSD storage

---

## Project Structure

### Repository Structure

```
prodganti-new/
├── backend/                          # Node.js API server
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   ├── controllers/              # Request handlers
│   │   ├── middleware/               # Express middleware
│   │   ├── models/                   # Database models
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   ├── utils/                    # Utility functions
│   │   └── app.ts                    # Application entry
│   ├── prisma/                       # Database migrations
│   ├── tests/                        # Test files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── common/               # Common UI components
│   │   │   ├── layout/               # Layout components
│   │   │   └── forms/                # Form components
│   │   ├── features/                 # Feature-specific components
│   │   ├── pages/                    # Page components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── services/                 # API services
│   │   ├── store/                    # Redux store
│   │   ├── styles/                   # Global styles
│   │   ├── types/                    # TypeScript types
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/                       # Static files
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker/                           # Docker configurations
│   ├── docker-compose.yml
│   ├── nginx/
│   │   └── default.conf
│   └── mysql/
│       └── init.sql
│
├── docs/                             # Documentation
│   ├── architecture/
│   ├── api/
│   └── guides/
│
├── scripts/                          # Utility scripts
│   ├── setup.sh
│   ├── backup.sh
│   └── restore.sh
│
├── .gitignore
├── .env.example
├── README.md
├── LICENSE
└── docker-compose.yml
```

### Directory Creation Commands

```bash
# Create project directory structure
mkdir -p prodganti-new/{backend/{src/{config,controllers,middleware,models,routes,services,utils},prisma,tests},frontend/{src/{components/{common,layout,forms},features,pages,hooks,services,store,styles,types,utils},public},docker/{nginx,mysql},docs/{architecture,api,guides},scripts}

# Initialize Git repository
cd prodganti-new
git init

# Create initial files
touch backend/src/app.ts backend/.env.example frontend/src/App.tsx
touch .gitignore README.md LICENSE

# Create package.json files
cd backend && npm init -y
cd ../frontend && npm create vite@latest . -- --template react-ts
```

---

## Development Tools Setup

### Git Configuration

```bash
# Configure Git
git config --global user.name "imadegun"
git config --global user.email "dabebeauteubud@gmail.com"

# Set default branch to main
git config --global init.defaultBranch main

# Enable credential caching (optional)
git config --global credential.helper cache

# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Database
*.sqlite
*.db

# Misc
*.tgz
.cache
EOF
```

### Node.js Setup

```bash
# Check Node.js version
node --version  # Should be 20.x

# Check npm version
npm --version  # Should be 9.x+

# Set npm to use package-lock.json
npm config set package-lock true

# Enable npm audit
npm config set audit true

# Set npm registry (optional, use mirror if needed)
npm config set registry https://registry.npmjs.org/
```

### Environment Variables Configuration

Create `.env` file in the root directory:

```bash
# Copy example env file
cp .env.example .env

# Or create new .env file
cat > .env << 'EOF'
# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# ===========================================
# DATABASE - PostgreSQL (Production Data)
# ===========================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prodganti

# ===========================================
# DATABASE - MySQL (gayafusionall Legacy Data)
# ===========================================
GAYAFUSION_HOST=localhost
GAYAFUSION_PORT=3306
GAYAFUSION_USER=root
GAYAFUSION_PASSWORD=root
GAYAFUSION_DATABASE=gayafusionall

# ===========================================
# AUTHENTICATION
# ===========================================
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# ===========================================
# SECURITY
# ===========================================
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=1800000

# ===========================================
# REDIS (Caching)
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ===========================================
# FILE STORAGE (Optional - for future use)
# ===========================================
STORAGE_TYPE=local
STORAGE_PATH=./uploads
# AWS_S3_BUCKET=
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=

# ===========================================
# EMAIL (Optional - for future use)
# ===========================================
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=debug
LOG_FORMAT=combined
EOF
```

---

## Database Setup

### PostgreSQL Setup

#### Installation (Windows)

1. Download PostgreSQL 15 from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set password for 'postgres' user
4. Keep default port 5432
5. Complete installation

#### Installation (macOS)

```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
psql -U postgres -c "CREATE USER prodganti WITH PASSWORD 'prodganti_secret';"
psql -U postgres -c "CREATE DATABASE prodganti OWNER prodganti;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE prodganti TO prodganti;"
```

#### Installation (Ubuntu/Debian)

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql
CREATE USER prodganti WITH PASSWORD 'prodganti_secret';
CREATE DATABASE prodganti OWNER prodganti;
\q

# Exit postgres user
exit
```

#### Create Database Schema

```bash
# Connect to PostgreSQL
psql -U prodganti -d prodganti

# Run initial schema (from backend directory)
# npx prisma migrate dev

# Or run SQL directly
\i prisma/migrations/001_initial_schema/migration.sql
```

### MySQL Setup (gayafusionall)

#### Installation (Windows)

1. Download MySQL 8.0 from https://dev.mysql.com/downloads/mysql/
2. Run the installer
3. Choose "Developer Default" or "Full" installation
4. Set root password
5. Keep default port 3306
6. Complete installation

#### Installation (macOS)

```bash
# Using Homebrew
brew install mysql@8.0

# Start MySQL service
brew services start mysql@8.0

# Secure MySQL installation
mysql_secure_installation
```

#### Installation (Ubuntu/Debian)

```bash
# Install MySQL
sudo apt update
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Create Database and Import Data

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE gayafusionall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import existing data (if available)
# mysql -u root -p gayafusionall < gayafusionall.sql

# Create read-only user for application
CREATE USER 'prodganti_read'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON gayafusionall.* TO 'prodganti_read'@'localhost';
FLUSH PRIVILEGES;
```

#### Sample gayafusionall Schema Reference

```sql
-- Reference schema for tblcollect_master (to be adjusted based on actual database)
CREATE TABLE tblcollect_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    texture VARCHAR(100),
    material VARCHAR(100),
    size VARCHAR(50),
    final_size VARCHAR(50),
    clay_type VARCHAR(100),
    clay_quantity DECIMAL(10,2),
    glaze TEXT,
    engobe TEXT,
    luster TEXT,
    stains_oxides TEXT,
    casting_tools TEXT,
    extruders TEXT,
    textures TEXT,
    general_tools TEXT,
    build_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_code (product_code),
    INDEX idx_product_name (product_name)
);
```

### Database Connection Test

Create a test script to verify database connections:

```typescript
// test-connections.ts
import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

async function testConnections() {
  console.log('Testing database connections...\n');

  // Test PostgreSQL
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`   Users in database: ${userCount}`);
  } catch (error) {
    console.log('❌ PostgreSQL connection failed');
    console.log('   Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }

  // Test MySQL (gayafusionall)
  try {
    const mysqlConnection = await mysql.createConnection({
      host: process.env.GAYAFUSION_HOST || 'localhost',
      port: parseInt(process.env.GAYAFUSION_PORT || '3306'),
      user: process.env.GAYAFUSION_USER || 'root',
      password: process.env.GAYAFUSION_PASSWORD || '',
      database: process.env.GAYAFUSION_DATABASE || 'gayafusionall',
    });
    
    await mysqlConnection.connect();
    console.log('\n✅ MySQL (gayafusionall) connected successfully');
    
    // Test query
    const [rows] = await mysqlConnection.execute('SELECT COUNT(*) as count FROM tblcollect_master');
    console.log(`   Products in database: ${rows[0].count}`);
    
    await mysqlConnection.end();
  } catch (error) {
    console.log('\n❌ MySQL connection failed');
    console.log('   Error:', error.message);
  }

  console.log('\nConnection tests completed.');
}

testConnections();
```

---

## Backend Setup

### Initialize Backend Project

```bash
# Navigate to backend directory
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors helmet morgan compression cookie-parser dotenv

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/morgan @types/compression @types/cookie-parser ts-node nodemon prisma eslint prettier

# Install Prisma
npm install prisma @prisma/client
npx prisma init

# Initialize TypeScript
npx tsc --init
```

### TypeScript Configuration

```json
// backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Express Application Setup

```typescript
// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import polRoutes from './routes/pol.routes';
import productionRoutes from './routes/production.routes';
import alertRoutes from './routes/alert.routes';
import reportRoutes from './routes/report.routes';
import logbookRoutes from './routes/logbook.routes';
import revisionRoutes from './routes/revision.routes';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/pols', polRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/logbook', logbookRoutes);
app.use('/api/v1/revisions', revisionRoutes);
app.use('/api/v1/products', productRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API URL: http://localhost:${PORT}/api/v1`);
});

export default app;
```

### Package.json Scripts

```json
// backend/package.json
{
  "name": "prodganti-backend",
  "version": "1.0.0",
  "description": "ProdGantiNew Production Tracking System API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:prod": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "@prisma/client": "^5.7.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/compression": "^1.7.5",
    "@types/cookie-parser": "^1.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "nodemon": "^3.0.2",
    "prettier": "^3.1.1",
    "prisma": "^5.7.1",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

---

## Frontend Setup

### Initialize Frontend Project

```bash
# Navigate to frontend directory
cd frontend

# Create React + TypeScript project using Vite
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install additional dependencies
npm install react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux axios react-hook-form zod @hookform/resolvers recharts date-fns

# Install dev dependencies
npm install -D @types/react @types/react-dom @types/react-router-dom eslint prettier
```

### TypeScript Configuration

```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@store/*": ["src/store/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Main Application Setup

```tsx
// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import POLManagement from './pages/POLManagement';
import ProductionTracking from './pages/ProductionTracking';
import Reports from './pages/Reports';
import Alerts from './pages/Alerts';
import Logbook from './pages/Logbook';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    secondary: {
      main: '#00796B',
      light: '#26A69A',
      dark: '#00695C',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFA000',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pols" element={<POLManagement />} />
              <Route path="production" element={<ProductionTracking />} />
              <Route path="reports" element={<Reports />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="logbook" element={<Logbook />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
```

### Package.json Scripts

```json
// frontend/package.json
{
  "name": "prodganti-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "format": "prettier --write src/**/*.ts src/**/*.tsx"
  },
  "dependencies": {
    "@emotion/react": "^11.11.3",
    "@emotion/styled": "^11.11.0",
    "@hookform/resolvers": "^3.3.3",
    "@mui/icons-material": "^5.15.3",
    "@mui/material": "^5.15.3",
    "@reduxjs/toolkit": "^2.0.1",
    "axios": "^1.6.3",
    "date-fns": "^3.0.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.2",
    "react-redux": "^9.0.4",
    "react-router-dom": "^6.21.1",
    "recharts": "^2.10.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  }
}
```

---

## Docker Setup

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: prodganti_postgres
    environment:
      POSTGRES_USER: prodganti
      POSTGRES_PASSWORD: prodganti_secret
      POSTGRES_DB: prodganti
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - prodganti_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prodganti"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # MySQL (gayafusionall)
  mysql:
    image: mysql:8.0
    container_name: prodganti_mysql
    environment:
      MYSQL_ROOT_PASSWORD: mysql_secret
      MYSQL_DATABASE: gayafusionall
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    networks:
      - prodganti_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis (for caching)
  redis:
    image: redis:7-alpine
    container_name: prodganti_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - prodganti_network
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: prodganti_backend
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://prodganti:prodganti_secret@postgres:5432/prodganti
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-key}
      GAYAFUSION_HOST: mysql
      GAYAFUSION_PORT: 3306
      GAYAFUSION_USER: root
      GAYAFUSION_PASSWORD: mysql_secret
      GAYAFUSION_DATABASE: gayafusionall
      CORS_ORIGIN: http://localhost:5173
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - prodganti_network
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: prodganti_frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - prodganti_network
    restart: unless-stopped

volumes:
  postgres_data:
  mysql_data:
  redis_data:

networks:
  prodganti_network:
    driver: bridge
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# docker/nginx/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker MySQL Init Script

```sql
-- docker/mysql/init.sql

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS gayafusionall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gayafusionall;

-- Sample table structure (adjust based on actual gayafusionall schema)
CREATE TABLE IF NOT EXISTS tblcollect_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(100),
    texture VARCHAR(100),
    material VARCHAR(100),
    size VARCHAR(50),
    final_size VARCHAR(50),
    clay_type VARCHAR(100),
    clay_quantity DECIMAL(10,2),
    glaze TEXT,
    engobe TEXT,
    luster TEXT,
    stains_oxides TEXT,
    casting_tools TEXT,
    extruders TEXT,
    textures TEXT,
    general_tools TEXT,
    build_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_code (product_code),
    INDEX idx_product_name (product_name)
);

-- Insert sample data for testing
INSERT INTO tblcollect_master (product_code, product_name, color, texture, material, size, final_size, clay_type, clay_quantity, glaze, build_notes) VALUES
('TP-MAIN', 'Teapot (Main Body)', 'Blue', 'Smooth', 'Stoneware', '500ml', '500ml', 'Stoneware', 2.5, 'Blue Glaze', 'Form by throwing, handle separately'),
('TP-LID', 'Teapot (Lid)', 'Blue', 'Smooth', 'Stoneware', '500ml', '500ml', 'Stoneware', 0.5, 'Blue Glaze', 'Fit to match main body'),
('CP-MAIN', 'Cup (Main Body)', 'White', 'Smooth', 'Porcelain', '250ml', '250ml', 'Porcelain', 1.0, 'Clear Glaze', 'Simple throwing form'),
('CP-HANDLE', 'Cup (Handle)', 'White', 'Smooth', 'Porcelain', '250ml', '250ml', 'Porcelain', 0.3, 'Clear Glaze', 'Attach after trimming'),
('BWL-MAIN', 'Bowl (Main)', 'Red', 'Textured', 'Earthenware', '12inch', '12inch', 'Earthenware', 3.0, 'Red Earthenware Glaze', 'Slab built with texture');

-- Create read-only user for application
CREATE USER 'prodganti_read'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON gayafusionall.* TO 'prodganti_read'@'%';
FLUSH PRIVILEGES;
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild containers
docker-compose up -d --build

# Restart a specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U prodganti

# View resource usage
docker stats
```

---

## Verification Steps

### Backend Verification

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Expected output:
# 🚀 Server running on port 3000
#    Environment: development
#    API URL: http://localhost:3000/api/v1

# In another terminal, test health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test API endpoints
curl http://localhost:3000/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### Frontend Verification

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm run dev

# Expected output:
#   VITE v5.0.10  ready in 300 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
#   ➜  press h + enter to show help
```

### Database Verification

```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U prodganti -d prodganti -c "\dt"

# Test MySQL connection
mysql -h localhost -P 3306 -u root -p -e "USE gayafusionall; SHOW TABLES;"

# Test Prisma connection
cd backend
npx prisma studio
```

### Docker Verification

```bash
# Check container status
docker-compose ps

# All containers should show "Up" status

# Check container health
docker inspect prodganti_postgres --format='{{.State.Health.Status}}'
docker inspect prodganti_mysql --format='{{.State.Health.Status}}'
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill process
kill <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# Or change port in .env file
PORT=3001
```

#### 2. Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS

# Test connection
psql -h localhost -p 5432 -U prodganti -d prodganti
```

#### 3. Node Module Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Try with npm ci
rm -rf node_modules package-lock.json
npm ci
```

#### 4. Docker Issues

```bash
# Check Docker daemon
docker version

# Restart Docker
sudo systemctl restart docker  # Linux

# Clear Docker cache
docker system prune -a

# Check container logs
docker-compose logs <service_name>
```

#### 5. TypeScript Compilation Errors

```bash
# Check TypeScript version
npx tsc --version

# Check tsconfig.json configuration
npx tsc --showConfig

# Fix common issues
# - Ensure all @types packages are installed
# - Check import paths
# - Verify type definitions
```

#### 6. Prisma Issues

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Check database connection
npx prisma db push

# Reset database (development only)
npx prisma migrate reset
```

### Getting Help

- **Documentation:** See `/docs` directory
- **API Documentation:** http://localhost:3000/api/docs (when implemented)
- **Issues:** Create issue in project repository

---

## Appendix

### A. Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | development | No |
| PORT | Backend port | 3000 | No |
| DATABASE_URL | PostgreSQL connection | - | Yes |
| GAYAFUSION_HOST | MySQL host | localhost | No |
| GAYAFUSION_PORT | MySQL port | 3306 | No |
| GAYAFUSION_USER | MySQL user | root | No |
| GAYAFUSION_PASSWORD | MySQL password | - | No |
| JWT_SECRET | JWT signing secret | - | Yes |
| FRONTEND_URL | Frontend URL | http://localhost:5173 | No |

### B. Useful Commands Reference

```bash
# Backend
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run linter
npm run format           # Format code
npm test                 # Run tests
npx prisma studio        # Open Prisma Studio

# Frontend
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run linter
npm run format           # Format code

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

### C. Project Structure Quick Reference

```
prodganti-new/
├── backend/           # API server
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── tests/        # Test files
├── frontend/         # React application
│   ├── src/         # Source code
│   └── public/      # Static files
├── docker/          # Docker configurations
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

---

**Document Status:** Draft  
**Next Review Date:** TBD  
**Approved By:** TBD  
**Approval Date:** TBD

# ProdGantiNew Backend API

Backend API for the ProdGantiNew Production Tracking System.

## Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15.x
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Testing**: Jest

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # Prisma client configuration
│   ├── controllers/      # Request handlers (to be implemented)
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/          # Database models (Prisma)
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── pol.routes.ts
│   │   ├── production.routes.ts
│   │   ├── alert.routes.ts
│   │   ├── report.routes.ts
│   │   ├── logbook.routes.ts
│   │   ├── revision.routes.ts
│   │   └── product.routes.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── pol.service.ts
│   │   ├── production.service.ts
│   │   ├── alert.service.ts
│   │   ├── report.service.ts
│   │   ├── logbook.service.ts
│   │   ├── revision.service.ts
│   │   └── product.service.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── validation.util.ts
│   │   ├── logger.util.ts
│   │   └── date.util.ts
│   └── app.ts           # Express app setup
├── prisma/
│   └── schema.prisma    # Database schema
├── tests/               # Test files
├── .env.example         # Environment variables template
├── .gitignore
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/prodgantinew"

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_FORMAT=dev
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

#### Using Docker
```bash
# Build the image
docker build -t prodgantinew-backend .

# Run the container
docker run -p 3000:3000 --env-file .env prodgantinew-backend
```

## API Documentation

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.prodgantinew.com/api/v1`

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

#### POL Management
- `GET /api/v1/pols` - List POLs
- `GET /api/v1/pols/:id` - Get POL details
- `POST /api/v1/pols` - Create POL (Manager only)
- `PUT /api/v1/pols/:id` - Update POL (Manager only)
- `DELETE /api/v1/pols/:id` - Delete POL (Manager only)

#### Production Tracking
- `GET /api/v1/production/:polDetailId/stages` - Get production stages
- `POST /api/v1/production/track` - Track production quantity
- `GET /api/v1/production/active` - Get active tasks

#### Alerts
- `GET /api/v1/alerts` - List alerts
- `PUT /api/v1/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/v1/alerts/:id/resolve` - Resolve alert

#### Reports
- `GET /api/v1/reports/pol-summary` - POL summary report
- `GET /api/v1/reports/forming-analysis` - Forming analysis
- `GET /api/v1/reports/qc-analysis` - QC analysis
- `GET /api/v1/reports/production-progress` - Production progress

#### Logbook
- `GET /api/v1/logbook` - List log entries
- `POST /api/v1/logbook` - Create log entry
- `PUT /api/v1/logbook/:id` - Update log entry

#### Revision Tickets
- `GET /api/v1/revisions` - List revision tickets
- `POST /api/v1/revisions` - Create revision (Manager only)
- `PUT /api/v1/revisions/:id/submit` - Submit for approval
- `PUT /api/v1/revisions/:id/approve` - Approve/Reject revision (Manager only)

#### Products
- `GET /api/v1/products/search` - Search products
- `GET /api/v1/products/:code` - Get product by code
- `GET /api/v1/products/:code/materials` - Get material requirements
- `GET /api/v1/products/:code/tools` - Get tool requirements
- `GET /api/v1/products/:code/notes` - Get build notes

### Health Check
- `GET /api/health` - API health check

## Database Schema

The application uses Prisma ORM with PostgreSQL. The schema includes:

- **Users** - User accounts and authentication
- **POLs** - Production Order Lists
- **POL Details** - Products within POLs
- **Production Records** - Production tracking at each stage
- **Decoration Tasks** - Custom decoration tasks
- **Discrepancy Alerts** - Quantity discrepancy notifications
- **Logbook Entries** - Daily production logs
- **Revision Tickets** - Design/production revision requests
- **Activity Logs** - User activity tracking

See `prisma/schema.prisma` for the complete schema.

## Development

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset the database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production:

- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret for JWT tokens
- `REFRESH_TOKEN_SECRET` - Strong secret for refresh tokens

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control (RBAC)
- CORS enabled for frontend
- Helmet for security headers
- Rate limiting (to be implemented)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Build Errors
```bash
# Clean build artifacts
rm -rf dist node_modules
npm install
npm run build
```

## License

MIT

## Support

For issues and questions, please contact the development team.

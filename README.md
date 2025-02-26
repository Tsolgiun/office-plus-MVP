# Office Plus MVP

A MERN stack application for office leasing management, focusing on the owner's platform. This application allows building owners to manage their office spaces, track leases, and handle property information.

## Features

- User authentication (Login/Register) for building owners
- Building management (CRUD operations)
- Office space management within buildings
- Dashboard with statistics and recent updates
- Bilingual support (English/Chinese)

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - Ant Design for UI components
  - Styled Components for styling
  - Zustand for state management
  - React Router for navigation
  - Axios for API communication

- **Backend:**
  - Node.js with Express
  - MongoDB for database
  - JWT for authentication
  - Mongoose for ODM
  - bcryptjs for password hashing

## Project Structure

```
office-plus-MVP/
├── backend/             # Node.js + Express backend
│   ├── models/         # MongoDB models
│   ├── controllers/    # Route controllers
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Server entry point
│
└── frontend-owner/     # React frontend for owners
    ├── src/
    │   ├── components/ # Reusable components
    │   ├── pages/     # Page components
    │   ├── services/  # API services
    │   ├── store/     # State management
    │   └── types/     # TypeScript types
    └── public/        # Static assets
```

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd office-plus-MVP
\`\`\`

2. Install dependencies:
\`\`\`bash
npm run install:all
\`\`\`

3. Set up environment variables:

Create \`.env\` file in the backend directory:
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/office-plus
JWT_SECRET=your_jwt_secret_key_here
\`\`\`

4. Start the development servers:
\`\`\`bash
npm run dev
\`\`\`

This will start both the backend server (port 5000) and frontend development server (port 5173).

## Available Scripts

- \`npm run install:all\` - Install dependencies for both frontend and backend
- \`npm run dev\` - Start both frontend and backend in development mode
- \`npm run start:backend\` - Start only the backend server
- \`npm run start:frontend\` - Start only the frontend development server
- \`npm run build\` - Build the frontend for production

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### Building Endpoints

- GET `/api/buildings` - Get all buildings for owner
- POST `/api/buildings` - Create new building
- GET `/api/buildings/:id` - Get building by ID
- PUT `/api/buildings/:id` - Update building
- DELETE `/api/buildings/:id` - Delete building
- GET `/api/buildings/search` - Search buildings

### Office Endpoints

- GET `/api/offices/building/:buildingId` - Get all offices in a building
- POST `/api/offices` - Create new office
- GET `/api/offices/:id` - Get office by ID
- PUT `/api/offices/:id` - Update office
- DELETE `/api/offices/:id` - Delete office
- GET `/api/offices/search` - Search offices

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the ISC License.

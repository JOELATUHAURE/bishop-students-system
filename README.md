# Bishop Stuart University Student Admission System

A comprehensive web-based Student Application and Admission System for Bishop Stuart University to support refugee applicants from Rwamwanja, Kyangwali, and Nakivale settlement sites.

## Features

- Multi-step application form with progress tracking and auto-save
- Document upload system for certificates and identification
- Admin dashboard with application review workflow
- Multi-language support (English, Swahili, French, Arabic, Runyankole)
- Mobile-first responsive design with offline capabilities
- Role-based access control for admins and reviewers

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based authentication
- **File Storage**: Local storage with Multer
- **Notifications**: Email & SMS via Twilio
- **Internationalization**: i18next for multi-language support
- **PWA**: Service Worker for offline capabilities

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL (v12 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/JOELATUHAURE/bishop-students-system.git
   cd bishop-students-system
   ```

2. Install dependencies:
   ```
   npm install
   npm run install-all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings

4. Run database migrations:
   ```
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Node.js API
  - `/controllers` - Request handlers
  - `/models` - Database models
  - `/routes` - API routes
  - `/middlewares` - Custom middlewares
  - `/utils` - Utility functions
  - `/uploads` - Uploaded files

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Applications

- `GET /api/applications` - Get all applications for current user
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/submit` - Submit application
- `DELETE /api/applications/:id` - Delete application
- `POST /api/applications/:id/education` - Add education record

### Documents

- `GET /api/documents/:id` - Get all documents for an application
- `POST /api/documents/:id` - Upload document
- `GET /api/documents/:id/:documentId` - Get document details
- `GET /api/documents/:id/:documentId/download` - Download document
- `DELETE /api/documents/:id/:documentId` - Delete document

### Admin

- `GET /api/admin/applications` - Get all applications (admin)
- `GET /api/admin/applications/:id` - Get application details (admin)
- `PUT /api/admin/applications/:id/review` - Review application
- `PUT /api/admin/applications/:id/documents/:documentId/verify` - Verify document
- `GET /api/admin/stats` - Get application statistics
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/export` - Export applications data

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Tailwind CSS](https://tailwindcss.com)
- [React](https://reactjs.org)
- [Express](https://expressjs.com)
- [Sequelize](https://sequelize.org)
- [Framer Motion](https://www.framer.com/motion)
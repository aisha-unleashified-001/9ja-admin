# 9jacart Admin Dashboard

A responsive admin dashboard for managing 9jacart's back office operations, built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Secure login system
- **Overview Dashboard**: Key metrics and recent activity
- **Waitlist Management**: View and manage vendor applications
- **Contact Management**: Handle customer inquiries and messages
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Clean interface with your brand colors

## Pages

- **Login** (`/login`) - Authentication page
- **Overview** (`/dashboard`) - Main dashboard with stats and recent activity
- **Waitlist** (`/dashboard/waitlist`) - List of vendor applications
- **Waitlist Detail** (`/dashboard/waitlist/:id`) - Individual vendor application details
- **Contacts** (`/dashboard/contacts`) - List of contact form submissions
- **Contact Detail** (`/dashboard/contacts/:id`) - Individual contact message details

## API Endpoints

The dashboard connects to these 9jacart API endpoints:

- `POST /api/auth/login` - Authentication
- `GET /backoffice/vendors/contacts` - List contacts with pagination
- `GET /backoffice/vendors/contacts/:id` - Individual contact details
- `GET /backoffice/vendors/waitlist` - List waitlist entries with pagination
- `GET /backoffice/vendors/waitlist/:id` - Individual waitlist entry details

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Configuration

The dashboard automatically uses:
- **Development**: `http://api.9jacart.ng` (avoids SSL certificate issues)
- **Production**: `https://api.9jacart.ng` (secure HTTPS)

You can override this by creating a `.env.local` file:
```
VITE_API_BASE_URL=https://api.9jacart.ng
```

## API Integration

The dashboard connects to the 9jacart API with the correct field mappings:
- Login uses `emailAddress` and `password` fields as expected by the backend
- All endpoints are properly configured for the back office operations

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── DashboardLayout.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   ├── Overview.tsx
│   ├── Contacts.tsx
│   ├── ContactDetail.tsx
│   ├── Waitlist.tsx
│   └── WaitlistDetail.tsx
├── services/
│   └── api.ts
├── types/
│   └── api.ts
└── lib/
    └── utils.ts
```

## Authentication

The dashboard uses token-based authentication. After successful login, the JWT token is stored in localStorage and included in all API requests.

## Responsive Design

The dashboard is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar on mobile
- Responsive tables and cards
- Touch-friendly interface elements
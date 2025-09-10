# Project Structure & Architecture

This document provides a comprehensive overview of the Smart Attendance Tracking System's architecture, components, and code organization.

## 📁 Directory Structure

```
smart-attendace-tracking/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── check-env/           # Environment check endpoint
│   ├── attendance/               # Attendance marking page
│   │   └── page.tsx             # Main attendance interface
│   ├── analytics/               # Analytics dashboard
│   │   ├── loading.tsx          # Loading component
│   │   └── page.tsx             # Analytics page
│   ├── dashboard/               # Main dashboard
│   │   └── page.tsx             # Role-based dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page (login)
├── components/                   # Reusable React components
│   ├── auth/                    # Authentication components
│   │   └── login-form.tsx       # User login form
│   ├── attendance/              # Attendance-related components
│   │   ├── create-session-form.tsx    # Session creation
│   │   ├── face-recognition.tsx       # Facial recognition
│   │   ├── qr-scanner.tsx             # QR code scanner
│   │   └── session-qr-code-dialog.tsx # QR display dialog
│   ├── dashboard/               # Dashboard components
│   │   ├── admin-dashboard.tsx        # Admin interface
│   │   ├── lecturer-dashboard.tsx     # Lecturer interface
│   │   └── student-dashboard.tsx      # Student interface
│   ├── analytics/               # Analytics components
│   │   └── attendance-analytics.tsx   # Analytics charts
│   ├── ui/                      # UI component library
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card component
│   │   ├── dialog.tsx           # Dialog/modal
│   │   ├── form.tsx             # Form components
│   │   ├── input.tsx            # Input fields
│   │   ├── table.tsx            # Data tables
│   │   └── ...                  # Other UI components
│   ├── theme-provider.tsx       # Theme management
│   └── session-status-badge.tsx # Status indicators
├── lib/                         # Utility libraries
│   ├── actions/                 # Server actions
│   │   └── admin.ts             # Admin operations
│   ├── supabase/                # Supabase configurations
│   │   ├── admin.ts             # Admin Supabase client
│   │   ├── middleware.ts        # Auth middleware
│   │   └── tsconfig.json        # TypeScript config
│   ├── supabase.ts              # Main Supabase client
│   ├── auth.ts                  # Authentication utilities
│   └── utils.ts                 # General utilities
├── hooks/                       # Custom React hooks
│   ├── use-mobile.tsx          # Mobile detection
│   └── use-toast.ts            # Toast notifications
├── scripts/                     # Database and utility scripts
│   ├── 001-create-tables.sql   # Database schema
│   ├── 002-seed-data.sql       # Sample data
│   ├── seed.ts                 # Database seeding script
│   └── tsconfig.json           # TypeScript config
├── supabase/                    # Supabase configurations
│   ├── functions/              # Edge functions
│   │   └── mark-attendance/    # Attendance marking function
│   │       └── index.ts        # Function implementation
│   ├── migrations/             # Database migrations
│   │   ├── 20250715191833_add_rls_policies.sql
│   │   ├── 20250715192514_fix_rls_and_add_helper_function.sql
│   │   └── 20250715192911_fix_rls_policies_definitive.sql
│   └── tsconfig.json           # TypeScript configuration
├── public/                      # Static assets
│   ├── placeholder-logo.png    # Logo placeholder
│   ├── placeholder-logo.svg    # SVG logo
│   ├── placeholder-user.jpg    # User avatar placeholder
│   └── placeholder.svg         # Generic placeholder
├── styles/                      # Additional styles
│   └── globals.css             # Additional global styles
├── node_modules/               # Dependencies
├── .env.local                  # Environment variables
├── components.json             # shadcn/ui configuration
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── middleware.ts              # Next.js middleware
```

## 🏗️ Architecture Overview

### Frontend Architecture (Next.js 15 + React 19)

The application uses **Next.js App Router** with the following patterns:

- **Server Components**: Used for initial page loads and data fetching
- **Client Components**: Used for interactive features requiring browser APIs
- **Server Actions**: Used for form submissions and data mutations

### State Management

- **Supabase Real-time**: For live attendance updates
- **React State**: For local component state
- **URL State**: For page-level state management

### Authentication Flow

```
Login Form → Supabase Auth → JWT Token → Protected Routes → Role-based Dashboard
```

## 🔧 Key Components Deep Dive

### Authentication System (`components/auth/`)

#### `login-form.tsx`
- Handles user authentication
- Form validation with React Hook Form + Zod
- Error handling and loading states
- Redirects based on user role

**Key Features:**
- Email/password authentication
- Role-based redirects
- Form validation
- Error messaging

### Dashboard Components (`components/dashboard/`)

#### `admin-dashboard.tsx`
**Responsibilities:**
- User management (CRUD operations)
- Course creation and management
- System-wide analytics
- Database maintenance

**Key Features:**
- User creation forms
- Course management interface
- Real-time user statistics
- Admin controls

#### `lecturer-dashboard.tsx`
**Responsibilities:**
- Course-specific attendance sessions
- Student enrollment management
- Session creation with QR codes
- Real-time attendance monitoring

**Key Features:**
- Session management
- QR code generation
- Live attendance tracking
- Student roster management

#### `student-dashboard.tsx`
**Responsibilities:**
- View enrolled courses
- Access attendance history
- Personal attendance statistics
- Quick attendance marking

**Key Features:**
- Course enrollment display
- Attendance percentage calculations
- Historical attendance records
- Quick access to attendance marking

### Attendance Components (`components/attendance/`)

#### `create-session-form.tsx`
**Purpose:** Create new attendance sessions
**Features:**
- Course selection
- Date/time scheduling
- Attendance method selection (QR/Facial/Hybrid)
- Automatic QR code generation

#### `face-recognition.tsx`
**Purpose:** Facial recognition attendance
**Features:**
- Camera access and stream handling
- Face detection and encoding
- Confidence scoring
- Real-time feedback

#### `qr-scanner.tsx`
**Purpose:** QR code scanning for attendance
**Features:**
- Camera integration
- QR code detection
- Real-time scanning feedback
- Error handling for camera permissions

#### `session-qr-code-dialog.tsx`
**Purpose:** Display QR codes for attendance sessions
**Features:**
- QR code generation and display
- Session information display
- Real-time session status
- Copy/share functionality

### Analytics Components (`components/analytics/`)

#### `attendance-analytics.tsx`
**Purpose:** Visualize attendance data
**Features:**
- Interactive charts (Recharts)
- Multiple chart types (bar, line, pie)
- Date range filtering
- Export functionality

## 🗄️ Database Layer

### Supabase Integration (`lib/supabase/`)

#### `supabase.ts`
- Main Supabase client for public operations
- Used for regular user queries and mutations
- Real-time subscriptions

#### `admin.ts`
- Admin Supabase client with elevated privileges
- Used for user management and system operations
- Bypasses Row Level Security when needed

#### `middleware.ts`
- Authentication middleware for protected routes
- Session management
- Route protection based on user roles

### Database Schema

The system uses the following tables:

```sql
-- Core tables
users (id, email, full_name, role, student_id, department, ...)
courses (id, course_code, course_name, lecturer_id, ...)
enrollments (student_id, course_id, enrolled_at)
attendance_sessions (id, course_id, lecturer_id, session_name, ...)
attendance_records (session_id, student_id, marked_at, method_used, ...)
```

## 🔐 Security & Authentication

### Authentication Flow
1. **Login**: User credentials → Supabase Auth
2. **JWT Token**: Generated and stored in cookies
3. **Middleware**: Validates tokens on protected routes
4. **Role Checks**: Database queries respect user roles
5. **RLS Policies**: Row-level security on all tables

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Row Level Security**: Database-level access control
- **Role-based Access**: Granular permissions
- **Secure API Keys**: Server-side only service keys
- **Input Validation**: Comprehensive validation with Zod

## 📱 UI/UX Architecture

### Design System
- **shadcn/ui**: Consistent component library
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitives
- **Lucide Icons**: Consistent iconography

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Tablet support**: Adaptive layouts
- **Desktop enhancement**: Full feature utilization

### Accessibility
- **WCAG 2.1**: Compliance with accessibility standards
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Proper ARIA labels
- **Color contrast**: High contrast ratios

## 🔄 Data Flow

### Attendance Marking Flow
```
Student Action → QR Scan/Face Recognition → API Call → Database Update → Real-time Update → Dashboard Refresh
```

### Session Creation Flow
```
Lecturer Input → Form Validation → Database Insert → QR Generation → Session Display → Student Access
```

### Analytics Flow
```
Data Query → Processing → Chart Generation → User Interaction → Filtered Results
```

## 🚀 Performance Optimizations

### Frontend Optimizations
- **Server Components**: Reduce bundle size
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js Image component
- **Caching**: Proper cache headers

### Database Optimizations
- **Indexes**: Optimized database indexes
- **RLS Policies**: Efficient security policies
- **Connection Pooling**: Supabase connection management
- **Query Optimization**: Efficient SQL queries

### Real-time Features
- **Supabase Realtime**: Live updates without polling
- **Optimistic Updates**: Immediate UI feedback
- **Background Sync**: Offline capability preparation

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Jest + React Testing Library
- Utility function testing
- Hook testing

### Integration Tests
- API route testing
- Database integration testing
- Authentication flow testing

### E2E Tests
- Critical user journey testing
- Cross-browser compatibility
- Mobile responsiveness testing

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Core Web Vitals
- **User Analytics**: Usage patterns and metrics

### Database Monitoring
- **Query Performance**: Slow query identification
- **Connection Health**: Database connection monitoring
- **Storage Usage**: Database size and growth tracking

This architecture provides a scalable, secure, and maintainable foundation for the Smart Attendance Tracking System.



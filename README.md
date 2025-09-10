# Smart Attendance Tracking System

A modern, hybrid smart attendance system built with Next.js, TypeScript, and Supabase that supports multiple attendance methods including QR code scanning and facial recognition.

## 🚀 Features

- **Multi-Role System**: Supports Admin, Lecturer, and Student roles with role-based access control
- **Hybrid Attendance Methods**:
  - QR Code scanning for quick attendance marking
  - Facial recognition for secure, hands-free attendance
  - Manual attendance tracking as fallback
- **Real-time Dashboard**: Live attendance monitoring and analytics
- **Course Management**: Full CRUD operations for courses and enrollments
- **Session Management**: Create and manage attendance sessions with flexible scheduling
- **Analytics & Reporting**: Comprehensive attendance analytics with visual charts
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React hooks + Supabase real-time
- **UI Components**: Radix UI primitives

### Database Schema

The system uses the following main entities:

- **Users**: Admin, Lecturer, Student roles with authentication
- **Courses**: Course information with lecturer assignments
- **Enrollments**: Student-course relationships
- **Attendance Sessions**: Individual class sessions with QR codes
- **Attendance Records**: Individual attendance markings

## 📋 Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendace-tracking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env .env.local
   ```

   Fill in your Supabase credentials (see [Environment Setup](#environment-setup) below)

4. **Set up the database**
   ```bash
   # Run database migrations
   npx supabase db push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Getting Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Settings → API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## 📊 User Roles & Permissions

### Admin
- Full system access
- User management (create/edit/delete users)
- Course management
- System-wide analytics
- Database seeding and maintenance

### Lecturer
- Create and manage courses
- Create attendance sessions
- View student enrollments
- Monitor attendance in real-time
- Generate attendance reports

### Student
- View enrolled courses
- Mark attendance via QR code or facial recognition
- View personal attendance history
- Check attendance statistics

## 🎯 Usage Guide

### For Students
1. **Login** with your student credentials
2. **Scan QR Code**: Use your device's camera to scan the QR code displayed in class
3. **Facial Recognition**: Allow camera access for facial recognition attendance
4. **View History**: Check your attendance records and statistics

### For Lecturers
1. **Create Course**: Set up new courses with course codes and details
2. **Manage Sessions**: Create attendance sessions with QR codes
3. **Monitor Live**: Watch students mark attendance in real-time
4. **Generate Reports**: View attendance analytics and export reports

### For Admins
1. **User Management**: Create and manage all user accounts
2. **System Oversight**: Monitor overall system usage and analytics
3. **Database Management**: Run maintenance and seeding operations

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── attendance/        # Attendance marking page
│   ├── analytics/         # Analytics dashboard
│   ├── dashboard/         # Main dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── attendance/       # Attendance-related components
│   ├── dashboard/        # Dashboard components by role
│   ├── ui/               # shadcn/ui components
│   └── analytics/        # Analytics components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configurations
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # General utilities
├── scripts/              # Database scripts and seeders
└── supabase/             # Supabase configurations
    ├── functions/        # Edge functions
    └── migrations/       # Database migrations
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions per user role
- **Secure API Keys**: Service role keys kept server-side only
- **Input Validation**: Comprehensive form validation with Zod

## 📈 Analytics & Reporting

The system provides comprehensive analytics including:

- **Attendance Rates**: By course, student, and time period
- **Real-time Monitoring**: Live attendance tracking during sessions
- **Historical Data**: Long-term attendance trends and patterns
- **Export Functionality**: CSV/PDF export for reports
- **Visual Charts**: Interactive charts using Recharts

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Digital Ocean App Platform

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
```

### Testing
```bash
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env.local` file exists in root directory
- Restart the development server after adding new variables
- Check variable names match exactly (case-sensitive)

**Database Connection Issues**
- Verify Supabase project is active
- Check API keys are correct
- Ensure RLS policies are properly configured

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the Supabase documentation

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies**



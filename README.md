# Base ShadCN Organization Template

A modern, production-ready Next.js template featuring Firebase Authentication, **organization management**, **team collaboration**, Stripe payments at the organization level, and a beautiful UI built with ShadCN components and Tailwind CSS.

## What Makes This Different?

This template extends the Base ShadCN Template with **full organization support**:

- **Multi-tenant Organizations**: Users can create and manage organizations
- **Team Management**: Invite and manage organization members with role-based access
- **Organization-based Billing**: Stripe subscriptions are tied to organizations, not individual users
- **Collaborative Workspaces**: Multiple users can work within the same organization context

## Features

- **Organization Management**: Complete multi-tenant organization system
  - Create and manage organizations
  - Organization switching and context
  - Organization settings and customization
  - Role-based access control (Owner, Admin, Member)
  - Organization invitations and member management
  - Member removal and permission management

- **Authentication**: Complete Firebase Authentication integration with NextAuth.js
  - Email/password sign-up and login
  - Password reset functionality
  - User onboarding flow with organization creation
  - Protected routes and session management
  - Admin SDK integration for server-side operations

- **Payment Integration**: Organization-level Stripe payment processing
  - Stripe customers created per organization (not per user)
  - Organization-based subscription management
  - Pricing table integration
  - Billing management at organization level
  - Support for both test and production modes

- **UI Components**: Beautiful, accessible components built with ShadCN
  - Dark/light theme support with `next-themes`
  - Responsive sidebar navigation
  - Toast notifications with Sonner
  - Currency selector
  - Pricing tables
  - Command palette
  - And many more pre-built components

- **Database**: Firebase Firestore integration
  - CRUD operations (Create, Read, Update, Delete)
  - Both client-side and server-side (Admin SDK) operations
  - Type-safe data models
  - Multi-tenant data architecture with organization-based data isolation
  - User-organization relationship management
  - Invitation and membership tracking

- **Security**: Built-in security features
  - Input validation utilities
  - Data encryption utilities
  - Secure cookie handling
  - Environment variable management

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) + [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Payments**: [Stripe](https://stripe.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm
- A Firebase project
- A Stripe account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd base-shadcn-org-template
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Copy [.env.example](.env.example) to `.env.local`:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

#### NextAuth Configuration
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=  # Generate with: openssl rand -base64 32
```

#### Firebase Client Configuration
Get these from your Firebase project settings:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

#### Firebase Admin SDK Configuration
Get these from your Firebase service account JSON:
```env
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_CLIENT_X509_CERT_URL=
FIREBASE_PROJECT_URL=
```

#### Stripe Configuration
```env
STRIPE_API_KEY=                           # Production secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=      # Production publishable key
TEST_STRIPE_API_KEY=                      # Test secret key
NEXT_PUBLIC_TEST_STRIPE_PUBLISHABLE_KEY= # Test publishable key
NEXT_PUBLIC_DARK_PRICING_TABLE_ID=       # Dark theme pricing table ID
NEXT_PUBLIC_LIGHT_PRICING_TABLE_ID=      # Light theme pricing table ID
```

#### Encryption
```env
ENCRYPTION_KEY=  # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Use the JSON values in your environment variables

### Stripe Setup

1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from Developers > API keys
3. Create pricing tables:
   - Go to Products > Pricing tables
   - Create tables for both light and dark themes
   - Copy the pricing table IDs to your environment variables

### Running the Application

Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
base-shadcn-org-template/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── login/
│   │   │   ├── sign-up/
│   │   │   ├── reset/
│   │   │   └── onboarding/     # Now creates organization
│   │   ├── (main)/              # Protected main app routes
│   │   │   ├── dashboard/       # Organization dashboard
│   │   │   ├── settings/        # User & organization settings
│   │   │   ├── preparing/
│   │   │   └── members/         # Organization member management
│   │   └── api/                 # API routes
│   │       └── auth/[...nextauth]/
│   ├── components/              # React components
│   │   ├── auth/               # Authentication forms
│   │   ├── dom/                # DOM-specific components
│   │   ├── layout/             # Layout components (with org switcher)
│   │   ├── main/               # Main app components
│   │   │   └── members/       # Member management components
│   │   └── ui/                 # ShadCN UI components
│   ├── constants/              # App constants
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Library configurations
│   │   ├── firebase/          # Firebase config
│   │   └── authOptions.ts     # NextAuth configuration
│   ├── models/                # TypeScript models
│   │   ├── User.ts           # User model
│   │   ├── Organization.ts   # Organization model
│   │   └── UserOrganization.ts # User-org relationships
│   ├── services/              # Business logic services
│   │   ├── firebase/         # Firebase operations
│   │   └── stripe/           # Stripe operations (org-based)
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── public/                   # Static assets
├── .env.example             # Environment variables template
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Explained

### Organization-Based Architecture

This template is designed for **multi-tenant SaaS applications** where:
- Users belong to one or more organizations
- Organizations have their own Stripe subscriptions
- Team members collaborate within organization contexts
- Billing and features are managed at the organization level

### Authentication & Onboarding Flow

1. **Sign Up** ([/sign-up](src/app/(auth)/sign-up/page.tsx))
   - User creates account with email/password
   - Firebase Authentication handles credential storage
   - Redirects to onboarding

2. **Onboarding** ([/onboarding](src/app/(auth)/onboarding/page.tsx))
   - Collects user information
   - **Creates new organization** (user becomes owner)
   - Creates Firestore user document
   - **Creates Stripe customer for the organization**
   - Links user to organization
   - Redirects to preparing

3. **Preparing** ([/preparing](src/app/(main)/preparing/page.tsx))
   - Setup completion step
   - Finalizes organization configuration

4. **Dashboard** ([/dashboard](src/app/(main)/dashboard/page.tsx))
   - Organization-specific dashboard
   - Protected route requiring authentication
   - Context-aware based on selected organization

### Organization Management

**Creating Organizations**
- First organization created during onboarding
- Users can create additional organizations
- Each organization gets its own Stripe customer

**Managing Members** ([/members](src/app/(main)/members/))
- Invite users to organization via email
- Assign roles: Owner, Admin, Member
- Remove members from organization
- View all organization members and their roles

**Organization Switching**
- Users can switch between organizations they belong to
- UI updates to reflect current organization context
- Sidebar includes organization switcher

**Roles & Permissions**
- **Owner**: Full control, can delete organization, manage billing
- **Admin**: Can manage members and settings
- **Member**: Basic access to organization resources

### Firebase Operations

Client-side operations (see [src/services/firebase/](src/services/firebase/)):
- `create.ts` - Create Firestore documents
- `retrieve.ts` - Read Firestore documents
- `update.ts` - Update Firestore documents
- `delete.ts` - Delete Firestore documents

Server-side Admin SDK operations (see [src/services/firebase/](src/services/firebase/)):
- `admin-create.ts`
- `admin-retrieve.ts`
- `admin-update.ts`
- `admin-delete.ts`
- `admin-reset.ts`

### Stripe Integration

**Organization-Level Billing:**
- Stripe customers are created **per organization**, not per user
- Customer creation happens during organization setup
- Organization owners manage subscriptions
- Pricing table integration with theme support
- Billing management in organization settings
- Multiple users in an organization share the same subscription
- See [src/services/stripe/](src/services/stripe/) for implementation

**Key Difference from Base Template:**
In the base template, each user has their own Stripe customer. In this template, the **organization** is the Stripe customer, enabling team-based billing.

### Theme Support

- Light/dark mode toggle
- System preference detection
- Theme-specific Stripe pricing tables
- Persistent theme preference

## Customization

### Update Site Information

Edit [src/constants/site.ts](src/constants/site.ts):
```typescript
export const title = "Your App Name"
export const shortenedTitle = "YAN"
export const root = isProd ? "https://yourapp.com" : "http://localhost:3000"
```

### Modify Collections

Update Firestore collection names in [src/constants/collections.ts](src/constants/collections.ts)

### Add New UI Components

This template uses ShadCN components. To add new components:
```bash
npx shadcn@latest add [component-name]
```

## Security Considerations

- Never commit `.env.local` to version control
- Keep Firebase service account credentials secure
- Use Stripe test mode during development
- Validate all user inputs server-side
- Review security rules in Firebase Console

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to any platform supporting Node.js:
- Railway
- Render
- Fly.io
- AWS Amplify
- Google Cloud Run

## License

MIT

## Support

For issues and questions, please open an issue in the GitHub repository.

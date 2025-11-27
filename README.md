# Quizlet Clone

A full-featured flashcard study application built with Next.js 14, PostgreSQL, and modern web technologies.

## Features

✨ **Core Features**
- 📚 Create and manage study sets with flashcards
- 📁 Organize study sets into folders
- ⭐ Star important flashcards
- 📥 Export study sets as JSON
- 🖨️ Print study sets
- 🔀 Combine multiple study sets

🎮 **Learning Modes**
1. **Flashcards** - Study cards with flip animations
2. **Learn** - Multiple choice quiz mode
3. **Match** - Memory matching game
4. **Test** - Comprehensive test with multiple question types

🎨 **UI/UX**
- 🌓 Dark/Light mode toggle
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🎯 Clean, modern interface

🔐 **Authentication**
- Google OAuth
- GitHub OAuth
- Secure session management with NextAuth

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC for type-safe APIs
- **Styling**: TailwindCSS
- **UI Components**: Custom components (shadcn/ui style)
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **State Management**: TanStack Query

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone <your-repo-url>
cd OurWings-NextJS
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup environment variables

Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
\`\`\`

### 4. Setup PostgreSQL Database

Make sure you have PostgreSQL installed and running. Create a new database:

\`\`\`sql
CREATE DATABASE quizlet_clone;
\`\`\`

Update the \`DATABASE_URL\` in your \`.env\` file with your PostgreSQL connection string.

### 5. Push database schema

\`\`\`bash
npm run db:push
\`\`\`

This will create all necessary tables in your PostgreSQL database.

### 6. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **users** - User accounts
- **accounts** - OAuth provider accounts
- **sessions** - User sessions
- **studySets** - Study sets created by users
- **flashcards** - Individual flashcards in study sets
- **folders** - Folders to organize study sets
- **folderStudySets** - Many-to-many relationship between folders and study sets
- **starredCards** - User's starred flashcards
- **activities** - User activity tracking

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: \`http://localhost:3000/api/auth/callback/google\`
6. Copy Client ID and Client Secret to \`.env\`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: \`http://localhost:3000/api/auth/callback/github\`
4. Copy Client ID and Client Secret to \`.env\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run db:push\` - Push schema changes to database
- \`npm run db:studio\` - Open Drizzle Studio (database GUI)

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── create/            # Create study set page
│   ├── dashboard/         # Dashboard page
│   └── sets/              # Study set pages and modes
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── modes/             # Learning mode components
│   ├── studyset/          # Study set components
│   └── ui/                # UI components
├── lib/                   # Utility functions
├── server/                # Server-side code
│   ├── api/              # tRPC API routes
│   ├── auth.ts           # NextAuth configuration
│   └── db/               # Database configuration
└── trpc/                  # tRPC client setup
\`\`\`

## Features Detail

### Study Sets
- Create study sets with unlimited flashcards
- Edit and delete study sets
- Add term and definition for each card
- View all cards in a list

### Learning Modes

#### 1. Flashcards Mode
- Flip cards to reveal definitions
- Navigate through cards with keyboard or buttons
- Progress indicator

#### 2. Learn Mode (Quiz)
- Multiple choice questions
- Instant feedback
- Score tracking
- Question randomization

#### 3. Match Mode (Memory Game)
- Match terms with definitions
- Timer to track performance
- Visual feedback for matches
- Limit of 6 pairs for optimal gameplay

#### 4. Test Mode
- Multiple question types:
  - Multiple choice
  - True/False
  - Written answers
- Comprehensive review after submission
- Score calculation

### Folders
- Create folders to organize study sets
- Add/remove study sets from folders
- View all sets in a folder

### Additional Features
- Export study sets as JSON
- Print study sets
- Combine two study sets into one
- Star important flashcards
- Activity tracking

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js 14:
- Netlify
- Railway
- DigitalOcean
- AWS
- Self-hosted

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and PostgreSQL

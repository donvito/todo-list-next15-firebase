# Next.js Firebase Todo App

A modern todo application built with Next.js 15 (App Router), Firebase, and Tailwind CSS. Features include task management with categories, priorities, deadlines, and image attachments.

## Features

- Create, edit, and delete tasks
- Add categories and priorities
- Set deadlines for tasks
- Attach images to tasks
- Modern UI with Tailwind CSS
- Fully responsive design
- Built with Next.js 15 App Router and Server Components
- Real-time updates with Firebase

## Prerequisites

Before you begin, ensure you have:
- Node.js 20.9.0 or later (required for Next.js 15)
- A Firebase account
- Git

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database and Storage in your project
3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and create a web app
   - Copy the Firebase config object
4. Set up Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in your project root
   - ⚠️ Never commit this file to version control
   - Use `serviceAccountKey.example.json` as a reference for the required format

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd windsurf-nextjs-firebase
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Set up service account:
```bash
cp serviceAccountKey.example.json serviceAccountKey.json
```

5. Update your configuration:
   - Add your Firebase config values to `.env`
   - Replace the contents of `serviceAccountKey.json` with your actual service account key from Firebase
   - Both files are gitignored by default for security

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                  # Next.js 15 App Router
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── lib/                 # Utility functions and Firebase setup
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Learn More

To learn more about the technologies used:

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository
2. Import your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Add your `serviceAccountKey.json` contents as a secret in Vercel
5. Deploy!

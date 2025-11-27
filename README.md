# FrugalFlow

A local-first Progressive Web App (PWA) for personal financial tracking with AI-powered receipt scanning.

## Features

- 🏠 **Local-First Architecture**: Your data stays on your device using RxDB
- ☁️ **Cloud Sync**: Optional backup and sync with Supabase
- 🤖 **AI Receipt Scanning**: Parse receipts using local LLM (via LM Studio)
- 📱 **Progressive Web App**: Install and use offline
- 🔒 **Privacy-Focused**: Your financial data is yours

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Local Database**: RxDB with Dexie adapter
- **Cloud Sync**: Supabase (PostgreSQL)
- **AI**: Local LLM integration via LM Studio

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) Supabase account for cloud sync
- (Optional) LM Studio for AI receipt scanning

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Budget
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials (if using cloud sync)

4. Run the development server:
```bash
npm run dev
```

### Supabase Setup

If you want to enable cloud sync, run the SQL commands in `SUPABASE_SETUP.sql` in your Supabase project's SQL editor.

## Project Structure

```
Budget/
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic and services
│   ├── App.jsx         # Main app component
│   └── index.css       # Global styles
├── index.html
└── package.json
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

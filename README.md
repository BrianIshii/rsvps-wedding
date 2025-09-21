# Wedding RSVP App

A beautiful, modern wedding RSVP application built with Remix and Cloudflare D1.

## Features

- 💕 Beautiful, responsive design
- 📱 Mobile-friendly interface
- 🗄️ Cloudflare D1 database for data storage
- 📊 Admin dashboard to view all RSVPs
- 📤 CSV export functionality
- ⚡ Serverless deployment on Cloudflare Workers

## Tech Stack

- **Frontend/Backend**: Remix
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Deployment**: Cloudflare Workers
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Cloudflare D1 Database

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create rsvp-db

# Update wrangler.toml with your database ID
```

### 3. Run Database Migrations

```bash
# Apply migrations to local database
npm run db:local

# Apply migrations to production database
npm run db:migrate
```

### 4. Development

```bash
# Start development server
npm run dev
```

### 5. Deploy

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## Database Schema

The app uses a simple SQLite schema with the following table:

```sql
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT 1,
  guests INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Routes

- `/` - Main RSVP form
- `/admin` - Admin dashboard to view all RSVPs

## Customization

### Wedding Details

Update the wedding information in `app/routes/_index.tsx`:

```tsx
// Update these details
<h3 className="font-medium text-gray-700">Date & Time</h3>
<p className="text-gray-600">Saturday, June 15th, 2024 at 4:00 PM</p>

<h3 className="font-medium text-gray-700">Location</h3>
<p className="text-gray-600">Garden Venue<br />123 Wedding Lane<br />Beautiful City, BC</p>
```

### Styling

The app uses Tailwind CSS. You can customize colors and styling in:
- `tailwind.config.js` - Tailwind configuration
- `app/styles/globals.css` - Global styles

## Environment Variables

Create a `.env` file for local development:

```env
ENVIRONMENT=development
```

## Deployment

The app is configured to deploy to Cloudflare Workers. After setting up your D1 database:

1. Update `wrangler.toml` with your database ID
2. Run `npm run deploy`

## Admin Dashboard

Access the admin dashboard at `/admin` to:
- View all RSVP responses
- See attendance statistics
- Export data as CSV
- Filter between attending and not attending guests

## License

MIT License - see LICENSE file for details.
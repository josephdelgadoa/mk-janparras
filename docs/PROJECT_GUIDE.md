# Vallarta Vows Marketing Suite - Project Documentation

## 1. Project Overview
**Vallarta Vows Marketing Suite** is a comprehensive React-based application designed to automate and enhance the marketing and lead management operations for Vallarta Vows, a premier wedding planning service in Puerto Vallarta. The suite integrates advanced AI capabilities (Gemini), CRM functionality, and WordPress synchronization to streamline workflows.

## 2. Technology Stack
*   **Frontend**: React 18, Vite, TypeScript
*   **Styling**: Tailwind CSS
*   **Database**: Supabase (PostgreSQL)
*   **AI Integration**: Google Gemini (via `@google/generative-ai` and `@google/genai`)
*   **CMS Integration**: WordPress REST API
*   **Hosting**: Hostinger VPS (Dockerized Nginx)
*   **State Management**: React `useState` / `useEffect` (Local), Custom Repositories (Data Access)

## 3. Project Structure
```
/src
  /components     # Reusable UI components (Layout, UI primitives)
  /pages          # Main feature pages (Smart Articles, Brand Ambassador, etc.)
  /services       # Logic layer for API calls, DB interactions, and AI
  /types          # TypeScript interfaces
/scripts          # Deployment, Seeding, and Utility scripts
/public           # Static assets
```

## 4. Key Modules

### 4.1. Smart Articles (`/src/pages/SmartArticles.tsx`)
**Purpose**: An AI-powered content engine for generating, optimizing, and publishing SEO-friendly articles to WordPress.
*   **Features**:
    *   **Content Generation**: Creates article drafts based on keywords and topics using Gemini.
    *   **SEO Optimization**: Analyzes word count and SEO scoring.
    *   **WordPress Sync**: Publishes draft or finished articles directly to the WordPress blog via REST API.
    *   **Dashboard**: View stats on drafts vs. published content.

### 4.2. Email Marketing Studio (`/src/pages/EmailMarketing.tsx`)
**Purpose**: Visual editor for managing and sending automated email templates.
*   **Features**:
    *   **Template Gallery**: Cards for 'Welcome', 'Follow-up', 'Venues', etc.
    *   **Visual Editor**: Interactive HTML preview and code editing for templates.
    *   **Testing**: Send test emails to verify layout and content.
    *   **Persistence**: Saves template changes to Supabase (`email_templates` table).

### 4.3. Brand Ambassador Toolkit (`/src/pages/BrandAmbassador.tsx`)
**Purpose**: A tool to generate consistent marketing assets featuring the brand persona (Robin).
*   **Features**:
    *   **AI Avatar Generation**: Uploads reference photos of the user to generate a consistent AI avatar in various settings (Office, Beach, etc.).
    *   **Voice Script Generator**: Generates 30s marketing scripts in different tones (Warm, Luxury, Casual) promoting specific services.
    *   **Asset Management**: Stores generated assets linked to the user.

### 4.4. Photoshoot Studio (`/src/pages/PhotoshootStudio.tsx`)
**Purpose**: A visualizer for planning wedding photo sessions.
*   **Features**:
    *   **Character Profiles**: define randomized or custom profiles for Bride & Groom (Ethnicity, Age, Outfit).
    *   **Vibe Selection**: Choose styles (e.g., 'Dreamy Golden Hour', 'Bohemian Jungle').
    *   **Location Scouting**: AI suggests locations based on the vibe.
    *   **Storyboard Generation**: Creates a visual storyboard of shot concepts using AI image generation.
    *   **Export**: Download generated shots as PNG/JPG.

### 4.5. WordPress Form Generator (`/src/pages/WordPressFormGenerator.tsx`)
**Purpose**: A utility to generate the code needed for the lead capture forms on the main website.
*   **Features**:
    *   **Code Factory**: Generates both the Google Apps Script (Backend) and HTML/JS (Frontend) code.
    *   **Lead Scoring Logic**: Frontend code includes multi-step wizard logic and validation.
    *   **Integration**: Connects form submissions to both Google Sheets and Supabase `leads` table.

### 4.6. CRM / Lead Dashboard (`/src/components/CRM`)
**Purpose**: Internal dashboard for managing wedding inquiries.
*   **Features**:
    *   **Lead Table**: View all inquiries synced from the website.
    *   **Status Tracking**: Manage lead pipeline (New, Contacted, Booked).

## 5. Backend Services (`/src/services`)

*   **`articleRepository.ts`**: Handles CRUD for articles and logic for pushing content to WordPress. Includes URL sanitization to ensure correct API endpoints.
*   **`templateRepository.ts`**: Manages email templates retrieval and updates from Supabase.
*   **`geminiService.ts`**: Centralized service for interacting with Google's Gemini models (Text & Image generation).
*   **`imageService.ts`**: Handles image generation requests and uploads generated images to the WordPress Media Library.
*   **`supabaseClient.ts`**: Singleton instance of the Supabase client.

## 6. Setup & Deployment

### Local Development
1.  **Install Dependencies**: `npm install`
2.  **Environment Variables**: Ensure `.env` contains:
    *   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
    *   `VITE_WORDPRESS_URL` (e.g., `https://vallartavows.com`)
    *   `VITE_WORDPRESS_USERNAME` / `VITE_WORDPRESS_APP_PASSWORD`
    *   `VITE_GEMINI_API_KEY`
3.  **Run Dev Server**: `npm run dev`

### Deployment (Hostinger VPS)
The project uses a custom deployment script for the Hostinger VPS.
1.  **Script**: `./deploy.sh`
2.  **Process**:
    *   Syncs files to VPS (`/root/vallartavows-mk`) via `rsync`.
    *   Builds Docker image on the VPS.
    *   Restarts the Nginx container on port **8006**.
3.  **URL**: `http://srv1229016.hstgr.cloud:8006`

## 7. Database Schema (Supabase)
*   **`leads`**: Stores inquiry details (partners, date, budget, status).
*   **`vv_articles`**: Blog content, status, and WP sync metadata.
*   **`email_templates`**: HTML content and metadata for marketing emails.
*   **`brand_assets`**: Reference images and generated avatars for the Brand Ambassador tool.

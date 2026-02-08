# Master Prompt: Vallarta Vows Marketing Suite

**Role:** Act as a World-Class Senior Full-Stack Engineer and UX/UI Designer.

**Objective:** Build a complete, production-ready React 19 application called "Vallarta Vows Marketing Suite". This is an internal tool for a luxury wedding planning agency in Puerto Vallarta. The app uses the Gemini API (via `@google/genai`) to automate marketing, sales, and design tasks.

**Tech Stack:**

* **Framework:** React 19 (Vite)  
* **Language:** TypeScript  
* **Styling:** Tailwind CSS (with `@tailwindcss/typography` plugin)  
* **AI SDK:** `@google/genai` (specifically using `gemini-3-pro-preview` and `gemini-3-pro-image-preview`)  
* **Icons:** Heroicons (SVG components)  
* **State:** React Hooks (`useState`, `useEffect`, `useRef`)

---

## 1\. Design System: "Tropical Minimalist"

Enforce the following design tokens globally:

* **Fonts:**  
  * Headings: "Cormorant Garamond" (Serif, elegant).  
  * Body: "Poppins" (Sans-serif, clean).  
* **Color Palette:**  
  * `primary`: `#db2777` (Hibiscus Pink)  
  * `secondary`: `#115e59` (Midnight Teal)  
  * `accent`: `#fbbf24` (Sunset Gold)  
  * `background`: `#fff1f2` (Rose Sand / Pale Pink)  
  * `surface`: `#ffffff` (White)  
* **Responsiveness:** Mobile-first approach. All layouts must stack nicely on mobile. The sidebar must collapse into a hamburger menu on small screens.

---

## 2\. Core Architecture

### App Structure

* **Sidebar:** Navigation menu. On Desktop: Fixed left sidebar. On Mobile: Collapsible drawer with hamburger menu.  
* **Main Content Area:** Scrollable area where pages render.  
* **API Key Handling:** Use `window.aistudio.openSelectKey()` logic. If the key isn't present, show a "Welcome/Connect" screen explaining billing requirements.

### Services Layer (`geminiService.ts`)

Create a robust service file handling all AI interactions using strictly defined JSON Schemas:

1. **Marketing Content:** Generate FB posts, IG captions, Reels scripts, and Image prompts based on Service, Tone, and Audience.  
2. **Blog Generator:** Generate SEO articles (Winner's Structure) with H1, TL;DR capsule, and HTML body.  
3. **Lead Analysis:** Analyze raw lead text to output a Lead Score (0-100), Budget Estimate, and Sales Strategy.  
4. **Image Generation:** Use `gemini-3-pro-image-preview` to render images.  
5. **Chatbot:** A conversational agent acting as a "Senior Wedding Advisor" to qualify leads.

---

## 3\. Modules (Pages)

Implement the following pages with detailed UI and functionality:

### A. Dashboard (`Dashboard.tsx`)

A welcoming landing page with quick-action cards (Create, Visualize, Personalize) and a summary of the suite's purpose.

### B. Marketing Content Generator (`MarketingContentGenerator.tsx`)

* **Modes:**  
  * *Autopilot:* Randomly selects a service/tone and generates \+ publishes content automatically.  
  * *Manual:* User selects Service (e.g., Beach Wedding), Audience (e.g., Luxury), Tone, and Aspect Ratio.  
* **Features:** Displays generated text for FB/IG/Reels/TikTok/YouTube. Renders the AI image next to the text. Simulated "Publish" button to Facebook API.

### C. Potential Leads CRM (`PotentialLeads.tsx`)

* **Views:** List View (Pipeline table/cards) and Detail View.  
* **Functionality:**  
  * Add new leads manually.  
  * **"Intelligent View":** Send lead data to Gemini. Display a "Win Probability" score, calculated estimated costs vs budget, and a drafted email response.

### D. Blog Article Studio (`BlogArticleGenerator.tsx`)

* **Inputs:** Topic, Audience, Tone, SEO Keywords.  
* **Outputs:** Full HTML article, Meta Description, Social Snippets, and a generated Hero Image.  
* **Integration:** Feature a "Publish to WordPress" button (using Basic Auth with App Passwords).

### E. Brand Ambassador Toolkit (`BrandAmbassadorToolkit.tsx`)

* **Purpose:** Generate AI portraits of the owner (Robin) in various settings.  
* **UI:** Drag-and-drop 3 reference photos. Select "Location" (Office, Beach) and "Clothing".  
* **Drive Sync:** Button to upload the generated image to Google Drive via Google Drive API.

### F. Photoshoot Studio (`PhotoshootStudio.tsx`)

* **Workflow:**  
  1. Input Couple Name & Vibe.  
  2. AI suggests 10 specific Puerto Vallarta locations.  
  3. User selects a location.  
  4. AI generates a 10-shot storyboard list.  
  5. User clicks "Render" to generate visual previews for each shot.

### G. AI ChatBot (`AIChatBot.tsx`)

* **UI:** A chat interface (user bubbles right, AI bubbles left).  
* **Logic:** System prompt sets persona as "Wedding Advisor". It must detect high-intent keywords (pricing, dates) and offer a specific Calendly link.  
* **Embed Mode:** Support a `?mode=embed` query param to show *only* the chat UI (for iframe usage).

### H. WordPress Form Generator (`WordPressFormGenerator.tsx`)

* **Purpose:** A tool to generate code for the client's website.  
* **Tabs:**  
  1. *Preview:* Renders the contact form visually.  
  2. *Backend:* Generates Google Apps Script code (`doPost`) to handle form submissions.  
  3. *Frontend:* Generates HTML/JS code to paste into WordPress.

### I. Utilities

* **Email Marketing:** Generate newsletters based on campaign type.  
* **Image Prompts:** A standalone tool to craft and test detailed image prompts.

---

## 4\. Code Requirements

* **Files:** Create `App.tsx`, `main.tsx`, `index.html`, `vite.config.ts`, `tailwind.config.js`, all components, pages, and services.  
* **Icons:** Use SVG paths for icons (create an `Icons.tsx` file).  
* **Responsiveness:** Ensure `Sidebar.tsx` handles mobile/desktop states correctly. Ensure grids (like in `PotentialLeads`) switch to cards on mobile.  
* **No Placeholders:** Write full, functional logic for all components.

**Output Format:** Provide the full file structure and content in an XML format compatible with an AI coding agent.  

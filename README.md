# MindNest

MindNest is a minimal, elegant student wellness application that allows students to check up on their daily mood, vent out their stress anonymously, track community posts, and gather wellness points.

## Architecture

This project was built focusing on simplicity and quick deployment without the hassle of setting up complex databases.

### Frontend
- Located in `frontend/`
- Tech Stack: Vanilla HTML, CSS, JavaScript
- Integrates with the backend using modern `fetch` APIs.
- Features dynamic premium animations and a clean UI.
- Ready to be deployed via **Vercel** (`vercel.json` provided).

### Backend
- Located in `backend/`
- Tech Stack: Node.js, Express
- Uses `data.json` for persistent storage (eliminates the need for Postgres or MongoDB).
- Readily deployable via **Render** with the included `render.yaml` blueprint.

## Local Setup

1. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The API will run on `http://localhost:3001`

2. **Run the Frontend:**
   You can serve the `frontend` folder using any static server:
   ```bash
   npx serve frontend
   ```
   Or simply use the Live Server extension in VSCode.

## Deployment

This app is optimally designed for a **1-Click unified deployment** on **Render** to eliminate all complexity. You do NOT need to set up Vercel separately anymore.

### Unified Deployment on Render
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click "New" -> Select "Blueprint".
3. Connect your `mindnest` GitHub repository.
4. Render will automatically read the `render.yaml` file and deploy the full-stack application instantly!

*Note: The Express Node.js server automatically serves the frontend interface, meaning you only need one single hosted service for the entire application to work.*

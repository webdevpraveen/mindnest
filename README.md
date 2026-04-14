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

### Vercel (Frontend)
1. Import this repository into Vercel.
2. The framework preset should be "Other".
3. The `vercel.json` file will automatically configure the correct output directory (`frontend`).

### Render (Backend)
1. Go to your Render Dashboard.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` file and deploy the `backend/` service seamlessly.

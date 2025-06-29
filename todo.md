# Backend Todo List for "Pulsar"

This is a detailed plan for building the backend server to power the Pulsar application. You can ask me anytime if the process require me to choose.

## 1. Project Setup & Foundational Work

- [x] **Choose a Tech Stack:**
  - [x] **Language/Framework:** Node.js with Express.js (or Fastify for higher performance).
  - [x] **Database:** SQLite for simplicity and local persistence, or PostgreSQL for a more robust solution.
  - [x] **WebSocket Library:** `ws` or `socket.io` for real-time progress updates.

- [x] **Initialize Project:**
  - [x] Set up `package.json` (`npm init -y`).
  - [x] Install core dependencies: `express`, `typescript`, `ts-node`, `nodemon`, `cors`, `dotenv`.
  - [x] Set up TypeScript configuration (`tsconfig.json`).
  - [x] Create a basic project structure:
    ```
    /src
    ├── api/          # API route definitions
    ├── services/     # Business logic (e.g., yt-dlp interaction)
    ├── controllers/  # Request/response handlers
    ├── models/       # Database models/schemas
    ├── websockets/   # WebSocket handling logic
    ├── utils/        # Helper functions
    └── index.ts      # Server entry point
    ```

- [x] **Environment & Configuration:**
  - [x] Set up `dotenv` to manage environment variables (`.env` file).
  - [x] Define configuration for `PORT`, `DOWNLOAD_DIRECTORY`, `DATABASE_PATH`, etc.
  - [x] Add a global error handling middleware.
  - [x] Implement a logging utility (e.g., `winston` or `pino`).
  - [x] Create a startup script/check to ensure `yt-dlp` and `ffmpeg` are installed and available in the system's PATH.

- [x] **Database Setup:**
  - [x] Install a database driver/ORM (e.g., `better-sqlite3`, or an ORM like `Prisma` or `TypeORM`).
  - [x] Define the database schema/models for:
    - `Download` (id, url, title, thumbnail, status, progress, format, error_message, created_at, file_path).
    - `ArgumentTemplate` (id, name, args).
    - `Setting` (key-value store for things like the active cookie file path).
  - [x] Write database initialization logic and migrations.

## 2. Core yt-dlp Service

- [x] **Create `YtDlpService.ts`:**
  - [x] Implement a function to execute `yt-dlp` commands safely as a child process (`child_process.spawn`).
  - [x] **Fetch Media Info:**
    - [x] Create a `getMediaInfo(url, cookiesPath?)` method.
    - [x] It should run `yt-dlp --dump-json --cookies <cookiesPath> <url>`.
    - [x] It must parse the JSON output and map it to the `MediaInfo` type.
    - [x] Handle errors (invalid URL, private video, network issues, etc.).
  - [x] **Handle Downloads:**
    - [x] Create a `startDownload(options)` method.
    - [x] It should construct and run the `yt-dlp` command with appropriate arguments:
      - [x] Format selection (`-f`).
      - [x] Output path and template (`-o`).
      - [ ] Cookies file (`--cookies`).
      - [ ] Custom arguments from templates.
      - [x] Progress tracking (`--progress`).
    - [x] It must capture `stdout` to parse progress updates.
    - [x] It must capture `stderr` to log errors.
    - [x] It must handle process exit codes to determine success, failure, or cancellation.
  - [x] **Manage Processes:**
    - [x] Keep a map of active download processes (`Map<downloadId, ChildProcess>`).
    - [x] Implement `cancelDownload(id)` which sends a `kill()` signal to the child process.
  - [x] **Version Check:**
    - [x] Create a `getVersion()` method that runs `yt-dlp --version`.

## 3. Real-Time Communication (WebSockets)

- [x] **Setup WebSocket Server:**
  - [x] Integrate a WebSocket server with the Express app.
  - [x] Create a connection manager to track connected clients.
- [x] **Implement Real-Time Events:**
  - [x] The `YtDlpService` should emit internal events for progress, completion, and errors using `EventEmitter`.
  - [x] A `WebSocketManager` listens to these events and broadcasts them to all connected clients.
  - [x] Define event messages:
    - `download:progress` (payload: { id, progress })
    - `download:complete` (payload: { id })
    - `download:error` (payload: { id, error })
    - `queue:updated` (a new download is added, or an existing one is cleared)

## 4. API Endpoints [x]

- [x] **`/api/info`:**
  - [x] `POST /` - Accepts a `url` in the body.
  - [x] Calls `YtDlpService.getMediaInfo(url)`.
  - [x] Returns the `MediaInfo` object or a structured error.

- [x] **`/api/downloads`:**
  - [x] `POST /` - Accepts download options (url, format, title, thumbnail).
  - [x] Creates a new `Download` record in the database with `pending` status.
  - [x] Calls `YtDlpService.startDownload()` asynchronously.
  - [x] Returns the new download item with its database ID.
  - [x] `GET /` - Fetches all downloads (for both queue and history) from the database.
  - [x] `POST /:id/cancel` - Calls `YtDlpService.cancelDownload(id)` and updates the database status.

- [x] **`/api/history`:**
  - [x] `DELETE /` - Deletes all completed, errored, and cancelled items from the `Downloads` table.

- [x] **`/api/settings`:**
  - [x] **Templates:**
    - [x] `GET /templates` - Fetches all templates from the database.
    - [x] `POST /templates` - Creates a new template.
    - [x] `PUT /templates/:id` - Updates an existing template.
    - [x] `DELETE /templates/:id` - Deletes a template.
  - [x] **Cookies:**
    - [x] `POST /cookies` - Accepts file upload (`multipart/form-data`).
    - [x] Saves the cookies file to a secure, configured location.
    - [x] Stores the file path in the `Settings` table.
    - [x] `DELETE /cookies` - Deletes the cookie file and clears the setting from the database.
    - [x] `GET /cookies` - Returns information about the currently loaded cookies file.

- [x] **`/api/version`:**
  - [x] `GET /` - Calls `YtDlpService.getVersion()` and returns the version string.

## 5. Deployment & Final Touches [x]

- [ ] **CORS:**
  - [ ] Configure the `cors` middleware to allow requests only from the frontend's origin in production.
- [ ] **Static File Serving:**
  - [ ] Add a secure endpoint to serve the downloaded files, e.g., `GET /files/:id`. This should verify the file path to prevent path traversal attacks.
- [ ] **Containerization:**
  - [ ] Write a `Dockerfile` that:
    - Uses a Node.js base image (e.g., `node:18-slim`).
    - Installs Python, `yt-dlp`, and `ffmpeg` via a package manager.
    - Copies the application code.
    - Installs npm dependencies.
    - Exposes the application port and defines data volumes.
- [ ] **Documentation:**
  - [ ] Create a `README.md` with detailed instructions for:
    - Dependencies (`yt-dlp`, `ffmpeg`).
    - Setup and installation.
    - Running the server.
    - Environment variable configuration.
    - A summary of all available API endpoints.
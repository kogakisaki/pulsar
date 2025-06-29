# Pulsar Backend

This is the backend server for the Pulsar application, built with Node.js, Express, TypeScript, and Prisma (SQLite). It interacts with `yt-dlp` to fetch media information and handle downloads, and provides real-time updates via WebSockets.

## Table of Contents

- [Dependencies](#dependencies)
- [Setup and Installation](#setup-and-installation)
- [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)

## Dependencies

Before running the backend, ensure you have the following installed on your system:

-   **Node.js** (v18 or higher recommended)
-   **npm** (Node Package Manager)
-   **yt-dlp**: A command-line program to download videos from YouTube.com and other video sites.
    -   Installation instructions: [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp#installation)
-   **ffmpeg**: A complete, cross-platform solution to record, convert and stream audio and video. `yt-dlp` uses `ffmpeg` for post-processing (e.g., converting formats, embedding metadata).
    -   Installation instructions: [ffmpeg Official Site](https://ffmpeg.org/download.html)

## Setup and Installation

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Prisma database:**
    This will create the SQLite database file (`dev.db`) and generate the Prisma Client.
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Server

-   **Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the server using `nodemon`, which automatically restarts the server on file changes. The server will run on `http://localhost:4000` (or the `PORT` specified in your `.env` file).

-   **Production Mode (Build and Start):**
    For production, you'll typically build the frontend assets first (from the `frontend` directory) and then build and start the backend.

    1.  **Build Frontend Assets (from `frontend` directory):**
        ```bash
        cd ../frontend
        npm run build
        cd ../backend
        ```
        This step compiles the frontend and places its static assets into `backend/public`.

    2.  **Build Backend (TypeScript Compilation):**
        ```bash
        npm run build
        ```
        This compiles the backend TypeScript code into JavaScript.

    3.  **Start the Server:**
        ```bash
        npm start
        ```
        The backend will serve both the frontend and API on a single port (default 4000, or your configured `PORT`).

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# Server Configuration
PORT=4000

# Download Configuration
DOWNLOAD_DIRECTORY=./downloads

# Database URL for Prisma (SQLite example)
DATABASE_URL="file:./dev.db"

# Frontend URL for CORS in production
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

All API endpoints are prefixed with `/api`.

### `POST /api/info`

Fetches media information for a given URL.

-   **Request Body:**
    ```json
    {
      "url": "string",
      "cookiesPath": "string" // Optional: Path to a Netscape-format cookies file
    }
    ```
-   **Response:** `MediaInfo` object (see `src/types.ts`) or an error.

### `POST /api/downloads`

Starts a new media download.

-   **Request Body:**
    ```json
    {
      "url": "string",
      "format": {
        "id": "string",
        "label": "string",
        "extension": "string",
        "size": "string" // Optional
      },
      "title": "string",
      "thumbnail": "string"
    }
    ```
-   **Response:** `DownloadItem` object (see `src/types.ts`) or an error.

### `GET /api/downloads`

Fetches all download items (queue and history).

-   **Response:** Array of `DownloadItem` objects.

### `POST /api/downloads/:id/cancel`

Cancels an active download.

-   **URL Parameters:** `id` (string) - The ID of the download to cancel.
-   **Response:** `{ message: string }`

### `DELETE /api/history`

Clears all completed, errored, and cancelled download items from the history.

-   **Response:** `{ message: string }`

### `DELETE /api/files/:id`

Deletes a specific downloaded file from the server and its corresponding record from the database.

-   **URL Parameters:** `id` (string) - The ID of the download record to delete.
-   **Response:** `{ message: string }`

### `GET /api/settings/templates`

Fetches all saved argument templates.

-   **Response:** Array of `ArgumentTemplate` objects (see `src/types.ts` - though currently defined in Prisma schema).

### `POST /api/settings/templates`

Creates a new argument template.

-   **Request Body:**
    ```json
    {
      "name": "string",
      "args": "string" // The yt-dlp arguments string, e.g., "--embed-metadata --add-metadata"
    }
    ```
-   **Response:** New `ArgumentTemplate` object.

### `PUT /api/settings/templates/:id`

Updates an existing argument template.

-   **URL Parameters:** `id` (string) - The ID of the template to update.
-   **Request Body:**
    ```json
    {
      "name": "string",
      "args": "string"
    }
    ```
-   **Response:** Updated `ArgumentTemplate` object.

### `DELETE /api/settings/templates/:id`

Deletes an argument template.

-   **URL Parameters:** `id` (string) - The ID of the template to delete.
-   **Response:** Empty 204 No Content.

### `GET /api/version`

Fetches the installed `yt-dlp` version.

-   **Response:** `{ version: "string" }`

## WebSocket Events

The backend broadcasts real-time updates to connected WebSocket clients. Clients can connect to `ws://localhost:4000` (or `ws://your-backend-host:PORT`).

Messages are sent as JSON objects with a `type` and `payload`.

-   **`download:progress`**
    -   **Payload:** `{ id: string, progress: number }`
    -   **Description:** Sent periodically during an active download to indicate progress.
-   **`download:complete`**
    -   **Payload:** `{ id: string }`
    -   **Description:** Sent when a download successfully completes.
-   **`download:error`**
    -   **Payload:** `{ id: string, error: string }`
    -   **Description:** Sent when a download encounters an error.
-   **`download:cancelled`**
    -   **Payload:** `{ id: string }`
    -   **Description:** Sent when a download is cancelled by the user.
-   **`queue:updated`**
    -   **Payload:** `{}` (or potentially a summary of the queue)
    -   **Description:** Sent when the download queue changes (e.g., new download added).
-   **`history:updated`**
    -   **Payload:** `{}`
    -   **Description:** Sent when the download history changes (e.g., items cleared or deleted).
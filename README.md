# ✨ Pulsar - Your Ultimate Media Downloader ✨

English | [Tiếng Việt](README-vi.md)

Pulsar is a sleek, powerful, and user-friendly application designed to make downloading videos and audio from your favorite websites a breeze! Built with a modern React frontend and a robust Node.js backend, Pulsar leverages the incredible `yt-dlp` tool to bring you a seamless downloading experience.

## 🚀 Features at a Glance

-   **🌐 Wide Compatibility:** Download from countless websites supported by `yt-dlp`.
-   **🖥️ Intuitive UI:** A clean, responsive interface for effortless navigation.
-   **📥 Smart Queue Management:** Keep track of your downloads with an organized queue.
-   **🕰️ Comprehensive History:** Easily review your past downloads, whether completed, errored, or cancelled.
-   **⚙️ Custom Argument Templates:** Save and reuse your favorite `yt-dlp` command-line arguments for tailored downloads.
-   **🍪 Cookie Support:** Seamlessly download content from sites requiring login by importing Netscape-formatted cookie files.
-   **⚡ Real-time Updates:** Watch your download progress unfold live with WebSocket-powered updates.
-   **🔍 Version Check:** Stay informed with built-in `yt-dlp` and `ffmpeg` version verification.

## 🏗️ Project Structure

Pulsar is neatly organized into two core components: `frontend` and `backend`.

```
pulsar/
├── backend/                # The brain of the operation: Node.js, Express, TypeScript, Prisma
│   ├── src/                # Backend TypeScript source code
│   ├── prisma/             # Database schema and migrations
│   ├── .env.example        # Environment variables template for backend
│   ├── package.json        # Backend dependencies and scripts
│   └── README.md           # In-depth documentation for the backend
├── frontend/               # The beautiful face: React, TypeScript, Vite
│   ├── public/             # Static assets (images, etc.)
│   ├── src/                # React/TypeScript source code for frontend
│   ├── package.json        # Frontend dependencies and scripts
│   └── README.md           # Detailed documentation for the frontend
├── .gitignore              # Files and directories ignored by Git
├── README.md               # You are here! Project overview.
└── README-vi.md            # Vietnamese version of this README.
```

[Tiếng Việt](README-vi.md)

## 🛠️ System Requirements

Before you embark on your downloading adventure, ensure your system has these essentials:

-   **Node.js** (v18 or higher is recommended)
-   **npm** (Node Package Manager)
-   **yt-dlp**: The powerful command-line video downloader.
    -   Installation Guide: [yt-dlp GitHub](https://github.com/yt-dlp/yt-dlp#installation)
-   **ffmpeg**: Essential for post-processing (like format conversion).
    -   Installation Guide: [ffmpeg Official Site](https://ffmpeg.org/download.html)

## 🚀 Getting Started: Setup & Installation

Let's get Pulsar up and running on your local machine!

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pulsar.git
    cd pulsar
    ```

2.  **Backend Setup:**
    Navigate to the `backend` directory, install dependencies, and set up the database.
    ```bash
    cd backend
    npm install
    npx prisma migrate dev --name init # Initializes Prisma and creates your SQLite database
    cp .env.example .env # Create your .env file from the example
    # ⚠️ Important: Edit your .env file to configure PORT, DOWNLOAD_DIRECTORY, FRONTEND_URL, etc.
    cd ..
    ```

3.  **Frontend Setup:**
    Move to the `frontend` directory and install its dependencies.
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## 🏃‍♀️ Running the Application

Pulsar can be run in two modes: development (two separate services) or production (single port).

### Development Mode (Two Terminals)

1.  **Start the Backend Server:**
    Open your first terminal, navigate to the `backend` directory, and launch the server:
    ```bash
    cd backend
    npm run dev
    ```
    The backend will be humming along at `http://localhost:4000` (or your configured `PORT`).

2.  **Start the Frontend Application:**
    Open a second terminal, go to the `frontend` directory, and fire up the UI:
    ```bash
    cd frontend
    npm run dev
    ```
    Your Pulsar UI will be live at `http://localhost:5173` (or your Vite-configured port).

Once both are running, open your browser and visit the frontend address.

### Production Mode (Single Port)

For a production deployment, the frontend assets are built and served by the backend on a single port.

1.  **Build Frontend Assets:**
    Open your terminal, navigate to the `frontend` directory, and build the frontend for production:
    ```bash
    cd frontend
    npm run build
    ```
    This will compile the frontend and place the static assets into the `backend/public` directory.

2.  **Build Backend (TypeScript Compilation):**
    Navigate to the `backend` directory and compile the TypeScript code:
    ```bash
    cd backend
    npm run build
    ```

3.  **Start the Backend Server:**
    From the `backend` directory, start the server:
    ```bash
    npm start
    ```
    The backend will serve both the frontend and API on a single port (default 4000, or your configured `PORT`). Access the application via the backend's address (e.g., `http://localhost:4000`).

## 💡 How to Use Pulsar

-   **Downloader Tab:** Paste your video/playlist URL, hit "Fetch Info," choose your desired format, and click "Add to Queue." Simple as that!
-   **History Tab:** Browse your past downloads. Easily clear completed, errored, or cancelled items.
-   **Settings Tab:** Fine-tune your experience! Manage custom `yt-dlp` argument templates and securely import/clear cookie files for private content.
-   **Real-time Magic:** Watch your download progress update instantly, thanks to WebSocket communication.

## 🎨 Customization

Tailor Pulsar to your needs!

### Environment Variables

Adjust environment variables in the `.env` file of the `backend` directory to change the server port, default download directory, and more.

For **production deployments** running on a single port (backend serving frontend), the `FRONTEND_URL` and `VITE_BACKEND_URL` configurations are generally not needed as the frontend and backend communicate on the same origin.

Example `backend/.env` (for local development):
```
# Server Configuration
PORT=4000

# Download Configuration
DOWNLOAD_DIRECTORY=./downloads

# Database URL for Prisma (SQLite example)
DATABASE_URL="file:./dev.db"

# Frontend URL for CORS in production (only needed if frontend is on a different origin)
# FRONTEND_URL=http://localhost:5173

# Cookie Configuration
COOKIE_FILE_PATH=./cookies.txt

# File Retention Configuration (in hours)
FILE_RETENTION_HOURS=5

# Backend URL (for internal use or if backend needs to know its own public URL)
# This should be your public backend URL in production, e.g., https://api.yourdomain.com
# BACKEND_URL=http://localhost:4000
```

## 👋 Contributing

We love contributions! If you have ideas, bug fixes, or new features, please feel free to fork the repository and submit a pull request.

## 📄 License

This project is proudly licensed under the MIT License. See the [LICENSE](LICENSE) file for full details.
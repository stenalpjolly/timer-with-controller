# ProPresenter Timer

A professional, remote-controllable countdown timer designed for stage displays and presentations. Built with React, Vite, and PeerJS for real-time P2P control.

## Features

- **Full Screen Timer**: Clean, high-contrast display optimized for confidence monitors.
- **Remote Control**: Control the timer from any device (phone/tablet) using a unique 4-letter pairing code. No server setup required (uses PeerJS).
- **Smart Segments**: Visual indication of current segment/talk section (e.g., "Intro", "Sermon", "Closing").
- **Traffic Light System**: Visual feedback as time runs out (Green -> Yellow -> Red -> Overtime).
- **Wake Lock**: Prevents the device from sleeping while the timer is running.
- **Overtime Tracking**: Counts up in red when time expires.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/stenalpjolly/timer-with-controller.git
   cd timer-with-controller
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (or the URL shown in your terminal).

## Usage

### Host (Display) Mode
1. Open the app on the screen that will be visible to the speaker.
2. Configure the total time and segments (optional).
3. Click **Start Timer**.
4. Note the **Pairing Code** displayed in the top right corner (e.g., `ABCD`).
5. Click the maximize icon to enter fullscreen mode.

### Remote Control Mode
1. Open the app on a second device (e.g., smartphone or tablet).
2. On the initial setup screen, click **Join as Remote**.
3. Enter the **Pairing Code** from the Host screen.
4. You now have full control to Play/Pause, Add/Subtract time, and Reset the timer.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **P2P Communication**: PeerJS (WebRTC)
- **Deployment**: Docker support included

## Deployment

### 1-Click Deployment

Deploy your own instance for free on Vercel or Netlify. Since the app uses PeerJS (P2P), no backend server is required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstenalpjolly%2Ftimer-with-controller) [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/stenalpjolly/timer-with-controller)

### Docker & Cloud Run Deployment

For self-hosting or enterprise deployment on Google Cloud Run:

**Option A: Docker Compose (Local)**
```bash
docker-compose up --build -d
```
The app will be available at `http://localhost:8080` (served via Nginx).

**Option B: Single-Command Cloud Run Deployment**
Ensure you have the `gcloud` CLI installed and authenticated.

```bash
./deploy.sh
```
You can optionally provide environment variables:
```bash
PROJECT_ID="my-project-id" REGION="us-east1" ./deploy.sh
```

## License

MIT

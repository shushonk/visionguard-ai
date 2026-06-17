# VisionGuard AI

VisionGuard AI is a sophisticated computer vision and security analytics dashboard built with React, Vite, and TensorFlow.js. It features a modern, responsive UI tailored for real-time monitoring and advanced AI-powered image analysis.

## Features

- **Dashboard View**: Real-time overview of system status, camera feeds, and recent security events.
- **AI Analysis Engine**: Upload and analyze individual frames using the neural engine (powered by TensorFlow.js and COCO-SSD).
- **Camera Monitoring**: Live feed monitoring with active tracking overlays.
- **Alerts & Analytics**: View and manage security alerts, and visualize data trends with Recharts.
- **Zones & Settings**: Configure tracking zones and system telemetry.

## Technology Stack

- **Frontend Framework**: React 19, Vite
- **Styling**: Tailwind CSS 4, Lucide React (Icons), Motion (Animations)
- **AI / Machine Learning**: TensorFlow.js (`@tensorflow/tfjs`), COCO-SSD (`@tensorflow-models/coco-ssd`)
- **Maps**: Leaflet, React Leaflet
- **Data Visualization**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shushonk/visionguard-ai.git
   ```

2. Navigate to the project directory:
   ```bash
   cd visionguard-ai
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server:
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Environment Variables

Create a `.env.local` file in the root of the project and add any necessary environment variables. For example:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## License

This project is proprietary. All rights reserved.

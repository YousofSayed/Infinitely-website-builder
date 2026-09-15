# Infinitely Studio

A powerful React-based visual development studio with integrated code editing capabilities, built with Vite and Electron support.

## Features

- 🎨 **Visual Editor** - Powered by GrapesJS for drag-and-drop web design
- 💻 **Code Editor** - Monaco Editor integration for advanced code editing
- ⚡ **Fast Development** - Vite-powered build system with HMR (Hot Module Replacement)
- 🖥️ **Desktop App** - Electron support for cross-platform desktop applications
- 📦 **Component Library** - Rich set of pre-built React components
- 🔄 **Undo/Redo** - Built-in state management with undo/redo functionality
- 🎯 **TypeScript Support** - Full TypeScript support for better developer experience
- 📱 **Responsive Design** - Tailwind CSS for modern, responsive layouts
- 🔌 **Plugin System** - Extensible plugin architecture
- 🚀 **Performance Optimized** - Million.js and other performance optimizations

## Tech Stack

- **Frontend Framework**: React 18.3+
- **Build Tool**: Vite 5.4+
- **State Management**: Recoil
- **Styling**: Tailwind CSS, Framer Motion
- **Visual Editor**: GrapesJS
- **Code Editor**: Monaco Editor
- **Desktop**: Electron
- **Database**: Dexie.js (IndexedDB wrapper)
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion, GSAP

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd infinitely-studio
```

2. Install dependencies:
```bash
npm install
```

## Available Scripts

### Development

```bash
# Start development server
npm start

# Development mode with increased memory allocation
npm run dev
```

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Electron

```bash
# Run Electron app in development mode
npm run electron:dev

# Build Electron application
npm run electron:build

# Run Electron directly
npm run electron
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix
```

## Project Structure

```
infinitely-studio/
├── src/                    # Source files
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   ├── components/        # Reusable React components
│   ├── views/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   ├── helpers/           # Utility functions
│   ├── lib/               # Third-party integrations
│   ├── plugins/           # Custom plugins
│   ├── assets/            # Static assets
│   └── styles/            # Global styles
├── public/                 # Public static files
├── electron-main.cjs       # Electron main process
├── preload.js             # Electron preload script
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## Configuration

### Vite Configuration

The project uses a custom Vite configuration (`vite.config.js`) with plugins for:
- PWA support
- SSL/HTTPS development
- Code splitting optimization
- Console removal in production

### Tailwind CSS

Customize the design system in `tailwind.config.js`.

### ESLint

ESLint configuration is defined in `.eslintrc.cjs` with React-specific rules.

## Key Dependencies

### Core Libraries
- `react` & `react-dom` - UI framework
- `grapesjs` - Visual web builder
- `@monaco-editor/react` - Code editor
- `recoil` - State management
- `react-router-dom` - Routing

### UI & Animation
- `framer-motion` - Animation library
- `tailwindcss` - Utility-first CSS
- `react-resizable-panels` - Resizable layout panels
- `react-draggable` - Draggable components

### Utilities
- `dexie` - IndexedDB wrapper for data persistence
- `opfs-tools` - Origin Private File System tools
- `jszip` - ZIP file creation/extraction
- `workbox-*` - Service worker utilities

## Electron Build Configuration

The Electron app is configured in `package.json` under the `build` key:

```json
{
  "appId": "com.infinitely.app",
  "productName": "Infinitely Studio",
  "files": [
    "dist/**/*",
    "electron-main.cjs",
    "preload.js"
  ]
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Tips

1. Use React.memo for expensive components
2. Leverage the built-in undo/redo system efficiently
3. Optimize large lists with react-virtuoso
4. Use code splitting for better initial load times

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on the repository.

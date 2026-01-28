# DataPrep.ai - Data Preprocessing Tool

A modern, browser-based data preprocessing application built with **Next.js** and **React**. Process your data locally with zero server-side storage or database requirements.

## Features

✨ **Browser-Based Processing**
- All data processing happens in your browser
- No data is sent to any server
- Single document processing at a time
- Completely private and secure

🔧 **Preprocessing Operations**
- Text case transformations (uppercase, lowercase, title case)
- Character removal and replacement
- Duplicate row removal
- Row deletion by index
- Date format conversion

📁 **File Support**
- Excel files (.xlsx, .xls)
- CSV files (.csv)
- Automatic parsing and display

📊 **Data Preview**
- Interactive data table with pagination
- Search functionality
- Column selection for operations
- Real-time data preview

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
data-prep/
├── app/                      # Next.js App Router
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── DataTable.tsx     # Data preview table
│   │   ├── UploadZone.tsx    # File upload component
│   │   ├── PreprocessingPanel.tsx  # Operations panel
│   │   └── Navbar.tsx        # Navigation
│   ├── hooks/               # Custom React hooks
│   │   ├── use-file.ts      # File state management
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/                 # Utilities
│   │   ├── schema.ts        # Data types and schemas
│   │   └── utils.ts         # Helper functions
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── public/                   # Static assets
├── package.json
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── next.config.ts           # Next.js configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run check` - Run TypeScript type checking

## Technology Stack

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **xlsx** - Excel file parsing
- **date-fns** - Date manipulation
- **Framer Motion** - Animations
- **React Dropzone** - File upload

## Data Processing

All data processing happens entirely in the browser. No data is stored on any server, and no data is sent anywhere unless you explicitly download the processed file.

### Supported Operations

1. **Text Case Transformations**
   - Capitalize (UPPERCASE)
   - Lowercase
   - Capitalize First Letter (Title Case)

2. **Character Operations**
   - Remove Characters
   - Replace Characters

3. **Data Cleanup**
   - Remove Duplicates (by selected columns)
   - Remove Rows (by index)

4. **Date Processing**
   - Convert Date Format (multiple formats supported)

## Keyboard Shortcuts

- Click on column headers in the data table to select/deselect columns
- "Select All Columns" checkbox in preprocessing panel for batch selection

## Browser Support

Works with all modern browsers supporting:
- ES2020+
- Web Workers (for future enhancements)
- Local Storage (optional, for future enhancements)

## License

MIT

## Notes

- Data is never persisted to disk unless you download it
- Each session loads one file at a time
- Processing is instant and responsive, even with large datasets
- No backend server required

---

Built with ❤️ for data preparation

# Getting Started with DataPrep.ai

## Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Run Development Server**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### 3. **Build for Production**
```bash
npm run build
npm start
```

## How to Use

### Uploading Files
1. **Drag and Drop**: Drag Excel (.xlsx, .xls) or CSV (.csv) files onto the upload zone
2. **Click to Browse**: Or click the upload zone to select files from your computer
3. The file is automatically parsed and displayed in the data table

### Viewing Data
- **Data Table**: Shows all rows with pagination (10 rows per page)
- **Search**: Use the search box to filter data by content
- **Column Selection**: Click column headers to select/deselect columns for operations

### Preprocessing Operations

#### Text Case Transformations
1. Select "Capitalize", "Lowercase", or "Capitalize First Letter"
2. Click on column headers or use checkboxes to select columns
3. Click "Apply Operation"

#### Remove Characters
1. Select "Remove Characters"
2. Enter the characters to remove (e.g., "-", " ", ",")
3. Select target columns
4. Click "Apply Operation"

#### Replace Characters
1. Select "Replace Characters"
2. Enter text to find and replacement text
3. Select target columns
4. Click "Apply Operation"

#### Remove Duplicates
1. Select "Remove Duplicates"
2. Choose columns to check for duplicates
3. Click "Apply Operation" (removes rows with duplicate values in selected columns)

#### Remove Rows
1. Select "Remove Rows"
2. Enter comma-separated row indices (0-based, e.g., "0, 2, 5")
3. Click "Apply Operation"

#### Convert Date Format
1. Select "Convert Date Format"
2. Select columns containing dates
3. Choose target format from dropdown
4. Click "Apply Operation"

### Downloading Results
1. After processing, click "Download" button
2. File is downloaded as Excel format with the same name as original
3. All processed data is included

### Clear File
Click "Clear" to remove current file and start over

## Important Notes

⚠️ **Data Privacy**
- All data processing happens in your browser
- No data is sent to any server
- Data only exists during your session
- Closing the browser clears all data

💡 **Single Document Processing**
- Only one file at a time
- Load a new file to replace the current one
- Each session is independent

⚡ **Performance**
- Processing is instant, even with large files
- No internet connection required (except for initial load)
- Works offline once loaded

🛠️ **Supported Formats**
- Excel: .xlsx, .xls
- CSV: .csv with standard comma separation

## Keyboard Tips
- Click column headers to quickly select/deselect columns
- Use "Select All Columns" checkbox to toggle all at once
- Press Tab to navigate between form elements

## Troubleshooting

**File won't upload?**
- Ensure file is .xlsx, .xls, or .csv format
- File size should be reasonable (under 10MB recommended)
- Try refreshing and uploading again

**Data looks strange after preprocessing?**
- Check that you selected the correct columns
- Verify the operation parameters
- Some operations are case-sensitive (lowercase, etc.)

**Want to undo a change?**
- Reload the page and re-upload the file
- Or use the browser's refresh button

## Technical Stack
- **Next.js 15** - Modern React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Responsive styling
- **Shadcn/ui** - Beautiful UI components
- **XLSX** - Excel file parsing
- **Framer Motion** - Smooth animations

## Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- ~10MB free RAM for processing

## Deployment

This application can be deployed on any static hosting platform:

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Traditional Server**
```bash
npm run build
# Deploy the .next folder and public folder
```

---

**Need Help?** Open an issue on GitHub or check the README.md for more details.

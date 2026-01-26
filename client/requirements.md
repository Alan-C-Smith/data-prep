## Packages
lucide-react | Iconography
date-fns | Date formatting
clsx | Class name merging
tailwind-merge | Class name merging
framer-motion | Animations
xlsx | For parsing Excel files locally if needed (though backend seems to handle parsing based on schema description, I will stick to simple upload)
react-dropzone | For drag and drop file uploads

## Notes
The backend expects multipart/form-data for uploads.
The `data` field in `files` table contains the JSON representation of the spreadsheet rows.
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  display: ["Outfit", "sans-serif"],
}

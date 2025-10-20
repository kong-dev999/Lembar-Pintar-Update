Place the Roobert Mono TRIAL font files in the `public/fonts/` folder.

Recommended filenames (used by the project):
- RoobertMonoTrial-Light.woff2
- RoobertMonoTrial-Light.woff

If you only have .ttf files, convert them to .woff2 for better performance. Then restart your dev server.

The project registers the font in `src/styles/globals.css` with a `@font-face` rule and exposes the `.roobert-mono` CSS class. Apply the `.roobert-mono` class to any container (for example the header) to make its children inherit the Roobert font.

Example:

<header className="flex items-center justify-between roobert-mono">...

Notes:
- Ensure usage of licensed fonts follows the font vendor's license. This project does not include font files by default.
- You can change the font-weight or add italic variants by adding more `@font-face` declarations pointing to other files and weights.
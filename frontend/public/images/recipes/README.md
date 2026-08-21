# Recipe photos (local files)

Most recipes use hotlinked Unsplash photos directly in `recipes.ts`. These 8 recipes use
local files instead (your own photos, originally saved in the project's `pics/` folder):

- `grilled-chicken-quinoa-bowl.jpg`
- `protein-oatmeal.jpg`
- `lemon-garlic-salmon.jpg`
- `chickpea-avocado-salad.jpg`
- `avocado-toast.jpg`
- `berry-protein-smoothie.jpg`
- `veggie-stir-fry.jpg`
- `berry-yogurt-parfait.jpg`
- `date-pistachio-parfait.jpg` (resized/compressed from the original 2.3 MB PNG you saved)

Vite serves anything in `public/` as-is at `/images/recipes/<filename>` — no rebuild
needed if you swap one out. Until a file exists, the card/modal shows a plain placeholder
background instead of a broken image icon.

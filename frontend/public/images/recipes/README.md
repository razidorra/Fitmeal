# Recipe photos (local files)

Most recipes use hotlinked Unsplash photos directly in `recipes.ts`. These nine recipes use
optimized local files instead:

- `grilled-chicken-quinoa-bowl.jpg`
- `protein-oatmeal.jpg`
- `lemon-garlic-salmon.jpg`
- `chickpea-avocado-salad.jpg`
- `avocado-toast.jpg`
- `berry-protein-smoothie.jpg`
- `veggie-stir-fry.jpg`
- `berry-yogurt-parfait.jpg`
- `date-pistachio-parfait.jpg`

Vite serves anything in `public/` as-is at `/images/recipes/<filename>`. A changed image is
available immediately in local development; a deployed static site must be rebuilt. If a file
is missing, the card/modal hides the broken image and leaves its placeholder background visible.
The former root-level source-image folder was removed after these production copies were verified.

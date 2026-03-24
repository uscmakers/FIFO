export type RecipeIngredient = {
  name: string;
  quantity: string;
};

export type RecipeResult = {
  recipe_name: string;
  prep_time_minutes?: number;
  ingredients: RecipeIngredient[];
  steps: string[];
};

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateRecipeFromFridge(
  availableIngredients: string[]
): Promise<RecipeResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");
  }

  const cleanedIngredients = [...new Set(
    availableIngredients
      .map((item) => item.trim())
      .filter(Boolean)
  )];

  if (cleanedIngredients.length === 0) {
    throw new Error("No ingredients available");
  }

  const prompt = `
You are a helpful recipe generator for a fridge app.

Create ONE recipe using mostly these ingredients:
${cleanedIngredients.map((item) => `- ${item}`).join("\n")}

Rules:
- Return JSON only.
- Use the schema exactly.
- Keep the recipe realistic and easy.
- Ingredient quantities must include measurements.
- Use common pantry staples only if absolutely necessary.
- Steps should be clear and short.
- The recipe should be something the user can make with these fridge ingredients.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: {
            type: "object",
            properties: {
              recipe_name: { type: "string" },
              prep_time_minutes: { type: "integer" },
              ingredients: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "string" },
                  },
                  required: ["name", "quantity"],
                },
              },
              steps: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["recipe_name", "ingredients", "steps"],
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text) as RecipeResult;
}
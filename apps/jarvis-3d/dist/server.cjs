var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, history, currentScene } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `User Prompt: ${prompt}
        
HISTORY:
${JSON.stringify(history)}

CURRENT SCENE STATE:
${JSON.stringify(currentScene)}
`,
        config: {
          systemInstruction: `You are Jarvis, a collaborative engineering and design companion focused on 3D prototyping and product creation.
The user will give you instructions to create or modify a 3D scene.
Your primary role is to interpret the user's creative requests and return a JSON object that strictly adheres to the schema.
You perceive a blank 3D canvas and populate it with shapes based on the user's prompt. You learn from their preferences.
You can create generic parametric shapes (box, sphere, cylinder, cone, torus).
In the JSON, you MUST provide an array of 'shapes', each with an id, type, position [x,y,z], rotation [x,y,z], scale [x,y,z], and hex color.
You must also provide a 'message' which is your companion response to the user.

Keep your message concise, helpful, and engineering-focused.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              message: {
                type: import_genai.Type.STRING,
                description: "Your conversational response as the Jarivs-like companion."
              },
              shapes: {
                type: import_genai.Type.ARRAY,
                description: "The complete array of shapes that should currently exist in the scene. If modifying, include both the modified and unmodified existing shapes.",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    id: { type: import_genai.Type.STRING },
                    type: { type: import_genai.Type.STRING, description: "One of: box, sphere, cylinder, cone, torus" },
                    position: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.NUMBER } },
                    rotation: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.NUMBER } },
                    scale: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.NUMBER } },
                    color: { type: import_genai.Type.STRING, description: "Hex color code" },
                    wireframe: { type: import_genai.Type.BOOLEAN, description: "Whether to render as wireframe" }
                  },
                  required: ["id", "type", "position", "rotation", "scale", "color"]
                }
              }
            },
            required: ["message", "shapes"]
          }
        }
      });
      res.json({ result: JSON.parse(response.text || "{}") });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to process request." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

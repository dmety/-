import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePointsFromText = async (prompt: string): Promise<Float32Array> => {
  const client = getClient();
  
  // We ask for a limited number of points (e.g., 500) to keep latency low and token usage reasonable.
  // We will replicate these points to fill the particle system buffer.
  const systemInstruction = `
    You are a 3D Geometry engine. 
    Your task is to generate a 3D point cloud representing the user's object description.
    Output a JSON object containing a flat array of numbers representing [x, y, z, x, y, z...] coordinates.
    Scale the model to fit roughly within a 4x4x4 cube (coordinates between -2 and 2).
    Generate approximately 150 points that capture the essence of the shape.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 3D point cloud for: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "Flat array of x, y, z coordinates"
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");

    const parsed = JSON.parse(jsonText);
    const pointArray = parsed.points;

    if (!Array.isArray(pointArray)) {
       throw new Error("Invalid format");
    }

    return new Float32Array(pointArray);

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // Return a fallback cube if error
    const count = 300;
    const fallback = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) fallback[i] = (Math.random() - 0.5) * 3;
    return fallback;
  }
};

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 15;

const VIN_PROMPT = `You are an expert automotive VIN reader. Extract the 17-character Vehicle Identification Number (VIN) from this image.

The VIN may appear:
- Stamped into metal on the dashboard (visible through windshield)
- Printed on a door jamb sticker
- On a registration or inspection sticker (possibly smudged or faded)
- On a VIN plate riveted to the vehicle body
- Etched into a window

VIN format rules:
- Exactly 17 characters: letters A-H, J-N, P, R-Z and digits 0-9
- NEVER contains letters I, O, or Q
- Common OCR confusion pairs to watch for: 0↔O, 1↔I, 5↔S, 8↔B, 2↔Z, D↔0

If you can partially read the VIN, return your best guess for all 17 characters.
Return ONLY valid JSON, no markdown: {"vin":"THE17CHARVIN12345","confidence":"high"}
Confidence levels: "high" (clearly readable), "medium" (some characters uncertain), "low" (mostly guessing), "none" (no VIN found)
If no VIN is found at all, return: {"vin":"","confidence":"none"}`;

// Initialize providers lazily
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Validate a VIN string (lightweight, no external calls).
 * Checks length, forbidden chars, and check-digit (position 9).
 */
function quickValidateVin(vin: string): { valid: boolean; error?: string } {
  const clean = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 17) {
    return { valid: false, error: `VIN must be 17 characters (got ${clean.length})` };
  }
  if (/[IOQ]/.test(clean)) {
    return { valid: false, error: 'VIN cannot contain I, O, or Q' };
  }

  // Check-digit validation (position 9, index 8)
  const translitMap: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = clean[i];
    const val = /\d/.test(char) ? parseInt(char) : (translitMap[char] ?? 0);
    sum += val * weights[i];
  }
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 'X' : String(remainder);

  if (clean[8] !== checkDigit) {
    // Check digit doesn't match — still return the VIN but mark as suspect
    return { valid: true, error: 'Check digit mismatch — verify VIN' };
  }

  return { valid: true };
}

/**
 * Extract VIN from base64 image using a vision model.
 */
async function extractVin(
  modelInstance: Parameters<typeof generateText>[0]['model'],
  imageBase64: string,
  mimeType: string
): Promise<{ vin: string; confidence: string }> {
  const { text } = await generateText({
    model: modelInstance,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: VIN_PROMPT },
          {
            type: 'image',
            image: imageBase64,
            mediaType: mimeType,
          },
        ],
      },
    ],
    maxOutputTokens: 100,
    temperature: 0.1, // Low temp for precise extraction
  });

  // Parse the JSON response
  const jsonMatch = text.match(/\{[^}]+\}/);
  if (!jsonMatch) {
    return { vin: '', confidence: 'none' };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const vin = (parsed.vin || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const confidence = parsed.confidence || 'none';
    return { vin, confidence };
  } catch {
    return { vin: '', confidence: 'none' };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    // Parse the data URL: "data:image/jpeg;base64,..." or raw base64
    let imageBase64 = image;
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:')) {
      const [header, data] = image.split(',');
      imageBase64 = data;
      const match = header.match(/data:(image\/\w+);/);
      if (match) mimeType = match[1];
    }

    // Size guard: ~750KB base64 ≈ ~500KB raw image
    if (imageBase64.length > 1_000_000) {
      return Response.json(
        { error: 'Image too large. Please try a closer, cropped photo.' },
        { status: 400 }
      );
    }

    let result: { vin: string; confidence: string } | null = null;
    let providerUsed = '';

    // Try Groq first (fastest, free tier)
    if (process.env.GROQ_API_KEY) {
      try {
        result = await extractVin(
          groq('meta-llama/llama-4-scout-17b-16e-instruct'),
          imageBase64,
          mimeType
        );
        providerUsed = 'groq';
      } catch (err: any) {
        console.warn('[VIN Scan] Groq failed, falling back to Gemini:', err?.message);
      }
    }

    // Fallback to Gemini if Groq failed or returned nothing
    if ((!result || !result.vin) && process.env.GEMINI_API_KEY) {
      try {
        result = await extractVin(
          google('gemini-2.0-flash'),
          imageBase64,
          mimeType
        );
        providerUsed = 'gemini';
      } catch (err: any) {
        console.error('[VIN Scan] Gemini also failed:', err?.message);
      }
    }

    if (!result || !result.vin) {
      return Response.json({
        vin: '',
        confidence: 'none',
        valid: false,
        error: 'Could not detect a VIN in this image. Try a clearer photo.',
        provider: providerUsed,
      });
    }

    // Validate the extracted VIN
    const validation = quickValidateVin(result.vin);

    return Response.json({
      vin: result.vin,
      confidence: result.confidence,
      valid: validation.valid,
      warning: validation.error || null,
      provider: providerUsed,
    });
  } catch (err: any) {
    console.error('[VIN Scan] Unexpected error:', err);
    return Response.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    );
  }
}

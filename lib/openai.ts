// openai.ts
import OpenAI, { ClientOptions } from "openai";

// Ensure the env var is available at build time
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_OPENAI_API_KEY in environment variables"
  );
}

// Type the options for safety
const options: ClientOptions = {
  apiKey,
  dangerouslyAllowBrowser: true,
};

const openai = new OpenAI(options);

export default openai;

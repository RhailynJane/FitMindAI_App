import OpenAI, { ClientOptions } from "openai";

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_OPENAI_API_KEY in environment variables"
  );
}

const options: ClientOptions = {
  apiKey,
  dangerouslyAllowBrowser: true,
};

const openai = new OpenAI(options);

export default openai;

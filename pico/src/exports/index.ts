import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

const question = (text: string): Promise<string> => {
  return rl.question(text);
};

export { question };

export const GENERATED_MESSAGE_METAFIELD_KEY = "generated_message";

const LOREM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio, et interdum nibh quis urna.",
  "Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. In condimentum facilisis porta.",
  "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  "Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.",
] as const;

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function generateOrderMessage() {
  const paragraph = pickRandom(LOREM_PARAGRAPHS);
  const generatedAt = new Date().toISOString();

  return `[Generated ${generatedAt}]\n${paragraph}`;
}

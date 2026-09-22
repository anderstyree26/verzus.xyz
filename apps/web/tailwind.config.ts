import type { Config } from 'tailwindcss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import preset from '@antigravity/config/tailwind/preset.js';

const config: Config = {
  presets: [preset as Config],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;

import { createTheme, type MantineColorsTuple } from '@mantine/core';

const iceruca: MantineColorsTuple = [
  '#e7f8ff',
  '#d2edfa',
  '#a8daf0',
  '#7ac5e6',
  '#58b4de',
  '#43a9d9',
  '#2694c3',
  '#19769d',
  '#0d5978',
  '#003c53',
];

export const theme = createTheme({
  primaryColor: 'iceruca',
  primaryShade: { light: 6, dark: 5 },
  colors: { iceruca },
  fontFamily: '"Noto Sans JP", "Segoe UI", sans-serif',
  headings: { fontFamily: '"Noto Sans JP", "Segoe UI", sans-serif' },
  defaultRadius: 'sm',
  components: {
    Button: { defaultProps: { radius: 'sm' } },
    Paper: { defaultProps: { radius: 'sm', shadow: undefined } },
  },
});

import type { ReactNode } from 'react';
import { ActionIcon, Box, Group, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import './AppChrome.css';

export function ProductHeader({ actions }: { actions?: ReactNode }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group h="100%" justify="space-between" wrap="nowrap" gap="sm">
      <Group gap={8} wrap="nowrap">
        <Box className="appChromeMark" aria-hidden>IC</Box>
        <Text size="sm" fw={700} className="appChromeTitle">ICeRuCa</Text>
        <Text size="xs" c="dimmed" className="appChromeVersion">0.1</Text>
      </Group>
      <Group gap={4} wrap="nowrap">
        <Tooltip label={colorScheme === 'dark' ? 'ライトモード' : 'ダークモード'}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            aria-label={colorScheme === 'dark' ? 'ライトモード' : 'ダークモード'}
            onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          >
            {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </ActionIcon>
        </Tooltip>
        {actions}
      </Group>
    </Group>
  );
}

export function PaneHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <Group className="appChromePaneHeader" px="sm" justify="space-between" wrap="nowrap">
      <Text size="xs" fw={700} c="dimmed">{title}</Text>
      {actions}
    </Group>
  );
}

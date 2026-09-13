import { useMemo, useState } from 'react';
import { Box, Group, Modal, NavLink, ScrollArea, Stack, Text } from '@mantine/core';
import { IconBook2, IconHelp } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { getHelpMarkdown, helpDocs } from './helpDocs';

export function HelpModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const [activeId, setActiveId] = useState(helpDocs[0].id);
  const active = helpDocs.find((item) => item.id === activeId) ?? helpDocs[0];
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(getHelpMarkdown(active.id), { async: false }) as string),
    [active.id],
  );

  return (
    <Modal opened={opened} onClose={onClose} fullScreen padding={0} radius={0}
      title={<Group gap="xs"><IconHelp size={18} /><Text fw={700}>ヘルプ</Text></Group>}
      closeButtonProps={{ 'aria-label': '閉じる' }}
      classNames={{ content: 'helpModalContent', header: 'helpModalHeader', body: 'helpModalBody' }}>
      <Box className="helpLayout">
        <aside className="helpNav" aria-label="ヘルプ目次">
          <ScrollArea h="100%"><Stack gap={2} p="sm">
            {helpDocs.map((item) => (
              <NavLink key={item.id} label={item.title} description={item.group}
                leftSection={<IconBook2 size={15} />} active={item.id === active.id}
                onClick={() => setActiveId(item.id)} />
            ))}
          </Stack></ScrollArea>
        </aside>
        <ScrollArea className="helpArticle">
          <Box className="helpMarkdown" p="xl" dangerouslySetInnerHTML={{ __html: html }} />
        </ScrollArea>
      </Box>
    </Modal>
  );
}

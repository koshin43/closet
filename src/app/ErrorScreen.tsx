import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { useRouteError } from 'react-router';

export function ErrorScreen() {
  const error = useRouteError();
  return (
    <Container size="xs" py="xl">
      <Stack role="alert" align="flex-start">
        <Title order={1}>Something Went Wrong</Title>
        <Text>{error instanceof Error ? error.message : 'An unexpected error happened.'}</Text>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </Stack>
    </Container>
  );
}

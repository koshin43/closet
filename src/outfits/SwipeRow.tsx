import { Carousel } from '@mantine/carousel';
import { Center, Group, Stack, Text } from '@mantine/core';
import type { EmblaCarouselType } from 'embla-carousel';
import { useEffect, useState, type ReactNode } from 'react';
import { ItemCard, type Item } from '../items';
import { PhotoFrame } from '../photos';

interface Props {
  label: string;
  options: Item[];
  value: string | null;
  onChange: (id: string | null) => void;
  tall?: boolean;
  action?: ReactNode;
}

export function SwipeRow({ label, options, value, onChange, tall = false, action }: Props) {
  const positions = [null, ...options.map((item) => item.id)];
  const index = Math.max(0, positions.indexOf(value));
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const ratio = tall ? 3 / 4 : 1;

  useEffect(() => {
    if (embla && embla.selectedScrollSnap() !== index) embla.scrollTo(index);
  }, [embla, index, positions.length]);
  return (
    <Stack component="section" aria-label={label} gap="xs">
      <Group justify="space-between" align="baseline">
        <Text fw={600}>{label}</Text>
        {action}
      </Group>
      <Carousel
        getEmblaApi={setEmbla}
        initialSlide={index}
        onSlideChange={(i) => i !== index && onChange(positions[i] ?? null)}
        emblaOptions={{ align: 'center', containScroll: false }}
        slideSize={{ base: tall ? '62%' : '48%', md: tall ? '34%' : '26%' }}
        slideGap="md"
        controlsOffset="xs"
        previousControlProps={{ 'aria-label': `Previous ${label}` }}
        nextControlProps={{ 'aria-label': `Next ${label}` }}
      >
        {positions.map((id, i) => {
          const item = options.find((option) => option.id === id);
          return (
            <Carousel.Slide key={id ?? 'none'} aria-current={i === index} style={{ opacity: i === index ? 1 : 0.45 }}>
              {item ? (
                <ItemCard item={item} ratio={ratio} showWishlist />
              ) : (
                <Stack gap={8}>
                  <PhotoFrame ratio={ratio}>
                    <Center h="100%">
                      <Text c="dimmed">None</Text>
                    </Center>
                  </PhotoFrame>
                  <Text size="sm">&nbsp;</Text>
                </Stack>
              )}
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </Stack>
  );
}

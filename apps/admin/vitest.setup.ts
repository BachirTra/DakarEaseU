import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement('a', { href, className }, children),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

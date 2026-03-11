import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BaseEntityDto } from "lib";
import { PrettyGrid } from "./PrettyGrid";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Loading: () => <div data-testid="loading" />,
}));

vi.mock("components", () => ({
  Empty: ({ message }: { message?: string }) => (
    <div data-testid="empty">{message}</div>
  ),
}));

type Item = BaseEntityDto & {
  name: string;
};

class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;

  observe = vi.fn((target: Element) => {
    this.target = target;
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

  private target: Element | null = null;
  private readonly callback: IntersectionObserverCallback;

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.rootMargin = options?.rootMargin ?? "";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0];
    observerInstances.push(this);
  }

  trigger(isIntersecting: boolean) {
    if (!this.target) return;

    const rect = this.target.getBoundingClientRect();
    const entry = {
      isIntersecting,
      target: this.target,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: rect,
      intersectionRect: rect,
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry;

    this.callback([entry], this);
  }
}

const observerInstances: IntersectionObserverMock[] = [];

const sampleData: Item[] = [
  {
    id: 1,
    name: "A",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 2,
    name: "B",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

describe("PrettyGrid", () => {
  beforeEach(() => {
    observerInstances.length = 0;
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: IntersectionObserverMock,
    });
  });

  it("renders classic grid behavior without infinite-scroll props", () => {
    const { container } = render(
      <PrettyGrid<Item>
        data={sampleData}
        renderComponent={(item) => <div data-testid="card">{item.name}</div>}
      />,
    );

    expect(screen.getAllByTestId("card")).toHaveLength(2);
    expect(container.querySelector(".pretty-grid-load-more")).toBeNull();
  });

  it("calls onLoadMore when sentinel intersects", async () => {
    const onLoadMore = vi.fn(async () => undefined);

    render(
      <PrettyGrid<Item>
        data={sampleData}
        hasMore
        onLoadMore={onLoadMore}
        renderComponent={(item) => <div>{item.name}</div>}
      />,
    );

    expect(observerInstances).toHaveLength(1);

    act(() => {
      observerInstances[0]?.trigger(true);
    });

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onLoadMore while loadingMore is true", () => {
    const onLoadMore = vi.fn(async () => undefined);

    render(
      <PrettyGrid<Item>
        data={sampleData}
        hasMore
        loadingMore
        onLoadMore={onLoadMore}
        renderComponent={(item) => <div>{item.name}</div>}
      />,
    );

    act(() => {
      observerInstances[0]?.trigger(true);
    });

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not double-trigger while a loadMore request is still in flight", async () => {
    const requestResolver: { current?: () => void } = {};
    const onLoadMore = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          requestResolver.current = resolve;
        }),
    );

    render(
      <PrettyGrid<Item>
        data={sampleData}
        hasMore
        onLoadMore={onLoadMore}
        renderComponent={(item) => <div>{item.name}</div>}
      />,
    );

    act(() => {
      observerInstances[0]?.trigger(true);
      observerInstances[0]?.trigger(true);
    });

    expect(onLoadMore).toHaveBeenCalledTimes(1);

    requestResolver.current?.();

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onLoadMore when hasMore is false", () => {
    const onLoadMore = vi.fn(async () => undefined);

    render(
      <PrettyGrid<Item>
        data={sampleData}
        hasMore={false}
        onLoadMore={onLoadMore}
        renderComponent={(item) => <div>{item.name}</div>}
      />,
    );

    expect(observerInstances).toHaveLength(0);
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});

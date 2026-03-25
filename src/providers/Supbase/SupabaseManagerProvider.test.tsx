import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseManagerProvider } from "./SupabaseManagerProvider";
import { useSupabase } from "./SupabaseContext";

const supabase = {
  from: vi.fn(),
  auth: {
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
} as unknown as SupabaseClient;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SupabaseManagerProvider supabase={supabase}>
    {children}
  </SupabaseManagerProvider>
);

describe("SupabaseManagerProvider", () => {
  it("returns supabase instance when used inside provider", () => {
    const { result } = renderHook(() => useSupabase(), { wrapper });

    expect(result.current).toBe(supabase);
  });

  it("throws when useSupabase is called outside provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useSupabase())).toThrow(
      "supabaseManagerContext must be used within a Provider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("uses a provided query client when queryClient prop is passed", () => {
    const customQueryClient = new QueryClient();
    const customWrapper = ({ children }: { children: ReactNode }) => (
      <SupabaseManagerProvider
        supabase={supabase}
        queryClient={customQueryClient}
      >
        {children}
      </SupabaseManagerProvider>
    );

    const { result } = renderHook(() => useQueryClient(), {
      wrapper: customWrapper,
    });

    expect(result.current).toBe(customQueryClient);
  });

  it("creates an isolated default query client per provider instance", () => {
    const wrapperOne = ({ children }: { children: ReactNode }) => (
      <SupabaseManagerProvider supabase={supabase}>
        {children}
      </SupabaseManagerProvider>
    );
    const wrapperTwo = ({ children }: { children: ReactNode }) => (
      <SupabaseManagerProvider supabase={supabase}>
        {children}
      </SupabaseManagerProvider>
    );

    const first = renderHook(() => useQueryClient(), {
      wrapper: wrapperOne,
    });
    const second = renderHook(() => useQueryClient(), {
      wrapper: wrapperTwo,
    });

    expect(first.result.current).not.toBe(second.result.current);
  });
});

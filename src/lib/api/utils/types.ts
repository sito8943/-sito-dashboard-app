export type HttpResponse<TResponse = unknown> = {
  data: TResponse | null;
  status: number;
  error: { status: number; message: string } | null;
};

import { runtimeConfig } from "@/config/runtime";

type SubscriptionHandlers<T> = {
  next: (value: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

// Minimal graphql-transport-ws client. Keeps the web app dependency-light while
// matching Strawberry's standard WebSocket protocol.
export function subscribeGraphQL<TData>(
  query: string,
  variables: Record<string, unknown>,
  handlers: SubscriptionHandlers<TData>,
): () => void {
  const socket = new WebSocket(runtimeConfig.graphqlWsUrl, "graphql-transport-ws");
  const id = crypto.randomUUID();
  let stopped = false;

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "connection_init", payload: {} }));
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(String(event.data));
      if (message.type === "connection_ack") {
        socket.send(JSON.stringify({ id, type: "subscribe", payload: { query, variables } }));
      } else if (message.type === "next" && message.id === id) {
        if (message.payload?.errors?.length) {
          handlers.error?.(new Error(message.payload.errors.map((x: { message?: string }) => x.message).join("; ")));
          return;
        }
        if (message.payload?.data) handlers.next(message.payload.data as TData);
      } else if (message.type === "error" && message.id === id) {
        handlers.error?.(new Error("GraphQL subscription failed."));
      } else if (message.type === "complete" && message.id === id) {
        handlers.complete?.();
      }
    } catch (error) {
      handlers.error?.(error instanceof Error ? error : new Error("Invalid GraphQL subscription message."));
    }
  });

  socket.addEventListener("error", () => handlers.error?.(new Error("GraphQL WebSocket connection failed.")));

  return () => {
    stopped = true;
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ id, type: "complete" }));
    }
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
    void stopped;
  };
}

import { useEffect, useRef } from "react";

type ItemRecord = {
  category: string;
  brand: string;
  item_name: string;
  count: number;
};

export function useNgrokSocket(onData: (data: ItemRecord[]) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      "wss://subobscurely-pseudobiographical-vivienne.ngrok-free.dev/ws"
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to Python server");
    };

    socket.onmessage = (event) => {
      console.log("RAW MESSAGE:", event.data);

      try {
        const parsed = JSON.parse(String(event.data));

        if (Array.isArray(parsed)) {
          onData(parsed);
        } else {
          console.log("Expected array, got:", parsed);
        }
      } catch (err) {
        console.log("Parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);
}
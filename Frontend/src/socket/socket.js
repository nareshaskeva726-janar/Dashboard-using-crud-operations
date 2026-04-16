import { io } from "socket.io-client";

const URL =
  import.meta.env.VITE_API || "http://localhost:5000";

const socket = io(URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: false,
});

export default socket;
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],   
  withCredentials: true,
  autoConnect: false           
});

export default socket;
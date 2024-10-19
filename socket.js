import { io } from "socket.io-client";
import { host } from "./app/api/APIroutes";

const socket = io(host);

export default socket;

import { io } from "socket.io-client";
import { host } from "./app/api/APIroutes";
import { useRef } from "react";

const socket = io(host);

export default socket;

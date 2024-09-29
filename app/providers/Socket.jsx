import React, { createContext, useContext, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { host } from '../api/APIroutes';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const socket = useRef();

    useEffect(() => {
        socket.current = io(host);

        return () => {
            socket.current.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};

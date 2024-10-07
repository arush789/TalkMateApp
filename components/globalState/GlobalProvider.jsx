import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalStateContext = createContext();

export const useGlobalState = () => useContext(GlobalStateContext);

export const GlobalStateProvider = ({ children, socket, currentUser }) => {
    const [lastMessageShow, setLastMessageShow] = useState({});

    return (
        <GlobalStateContext.Provider value={{ lastMessageShow, setLastMessageShow }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

import React, { createContext, useState, useContext } from 'react';

const SafeModeContext = createContext();

export const SafeModeProvider = ({ children }) => {
    const [isSafeMode, setIsSafeMode] = useState(false);

    return (
        <SafeModeContext.Provider value={{ isSafeMode, setIsSafeMode }}>
            {children}
        </SafeModeContext.Provider>
    );
};

export const useSafeMode = () => useContext(SafeModeContext);

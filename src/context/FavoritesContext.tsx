import React, { createContext, useContext, useReducer } from 'react';

interface FavoriteItem {
 id: number;
 name: string;
 price: number;
 image: string;
 userId?: number | null;
}

interface FavoritesState {
 items: FavoriteItem[];
}

type FavoritesAction = 
 | { type: 'ADD_FAVORITE'; payload: FavoriteItem }
 | { type: 'REMOVE_FAVORITE'; payload: number };

const FavoritesContext = createContext<{
 state: FavoritesState;
 dispatch: React.Dispatch<FavoritesAction>;
} | undefined>(undefined);

const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
 switch (action.type) {
   case 'ADD_FAVORITE':
     return { ...state, items: [...state.items, action.payload] };
   case 'REMOVE_FAVORITE':
     return { ...state, items: state.items.filter(item => item.id !== action.payload) };
   default:
     return state;
 }
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [state, dispatch] = useReducer(favoritesReducer, { items: [] });
 return (
   <FavoritesContext.Provider value={{ state, dispatch }}>
     {children}
   </FavoritesContext.Provider>
 );
};

export const useFavorites = () => {
 const context = useContext(FavoritesContext);
 if (!context) {
   throw new Error('useFavorites must be used within a FavoritesProvider');
 }
 return context;
};

import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
} from 'redux-persist'

import cartReducer from './cartSlice'
import authReducer from './authSlice'

// Custom localStorage adapter
const storage = {
  getItem: (key) => {
    return Promise.resolve(
      window.localStorage.getItem(key)
    )
  },

  setItem: (key, value) => {
    window.localStorage.setItem(key, value)
    return Promise.resolve(value)
  },

  removeItem: (key) => {
    window.localStorage.removeItem(key)
    return Promise.resolve()
  },
}

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage,
}

// Persisted reducer
const persistedReducer = persistReducer(
  persistConfig,
  cartReducer
)

// Redux store
export const store = configureStore({
  reducer: {
    cart: persistedReducer,
      auth: authReducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/FLUSH',
        ],
      },
    }),
})

// Persistence controller
export const persistor = persistStore(store)

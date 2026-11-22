
import { createSlice } from '@reduxjs/toolkit'

const getInitialAuth = () => {
  try {
    const user = sessionStorage.getItem('shopsphere_user')

    return {
      user: user ? JSON.parse(user) : null,
      isAuthenticated: Boolean(user),
    }
  } catch {
    return {
      user: null,
      isAuthenticated: false,
    }
  }
}

const authSlice = createSlice({
  name: 'auth',

  initialState: getInitialAuth(),

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer

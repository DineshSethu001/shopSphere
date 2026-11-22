
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { loginUser } from '../services/authService'
import { setCredentials } from '../redux/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      setLoading(true)

      const data = await loginUser(form)

      sessionStorage.setItem('shopsphere_token', data.token)
      sessionStorage.setItem('shopsphere_user', JSON.stringify(data.user))

      dispatch(setCredentials(data.user))

      navigate(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid email or password.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-center text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Login to your ShopSphere account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            className="w-full rounded-lg border p-3"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full rounded-lg border p-3"
          />

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600">
            Register
          </Link>
        </p>

      </div>
    </section>
  )
}

export default Login

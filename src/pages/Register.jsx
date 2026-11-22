
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { registerUser } from '../services/authService'
import { setCredentials } from '../redux/authSlice'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError('Password must be between 8 and 72 characters.')
      return
    }

    try {
      setLoading(true)

      const data = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      sessionStorage.setItem('shopsphere_token', data.token)
      sessionStorage.setItem('shopsphere_user', JSON.stringify(data.user))

      dispatch(setCredentials(data.user))

      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-12">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

        <h1 className="text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Join ShopSphere today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            maxLength={100}
            className="w-full rounded-lg border p-3"
          />

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
            placeholder="Password (minimum 8 characters)"
            required
            minLength={8}
            maxLength={72}
            className="w-full rounded-lg border p-3"
          />

          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>

      </div>
    </section>
  )
}

export default Register

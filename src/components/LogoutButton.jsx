import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/authSlice'

const LogoutButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem('shopsphere_token')
    sessionStorage.removeItem('shopsphere_user')

    dispatch(logout())
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg px-4 py-2 text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  )
}

export default LogoutButton
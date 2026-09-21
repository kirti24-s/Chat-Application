import './RightSidebar.css'
import assets from '../../Chat_App_Assets/assets/assets'
import { logout } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'

const RightSidebar = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className='rs'>
      <div className='chat-profile'>
        <img src={assets.profile_img} alt="" />
        <h3>Kirti Sheth<img src={assets.green_dot} alt="" /></h3>
        <p>Hey there! I am using Chat App </p>
      </div>
      <hr />

      <div className='rs-media'>
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
        </div>

      </div>
      <button type='button' onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default RightSidebar

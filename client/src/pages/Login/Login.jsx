import "./Login.css";
import assets from "../../Chat_App_Assets/assets/assets";
import { useState } from "react";
import { login, signup,resetPass } from "../../config/firebase";
import { toast } from "react-toastify";
import { sendPasswordResetEmail } from "firebase/auth";

const Login = () => {
  const [currState, setcurrState] = useState("Login");
  const [userName,setUserName] = useState("");
  const [email,setEmail] = useState("");
  const[password,setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currState === "Sign Up") {
        await signup(userName, email, password);
      }
      else{
        await login(email,password);
      }
    } catch (error) {
    toast.error(error.message || "Login failed!");
    }
  };
  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        {currState == "Login" ? <h2> Login </h2> : <h2>Sign Up</h2>}

        {currState == "Login" ? null : (
          <input onChange={(e) => setUserName(e.target.value)} value={userName}
            type="text"
            placeholder="username"
            className="form-input"
            required
          />
        )}

        <input onChange={(e) => setEmail(e.target.value)} value={email}
          type="email"
          placeholder="email"
          className="form-input"
          required
        />
        <input onChange={(e) => setPassword(e.target.value)} value={password}
          type="password"
          placeholder="password"
          className="form-input"
          required
        />
        {currState == "Login" ? (
          <button type="submit">Login</button>
        ) : (
          <button type="submit">Sign Up</button>
        )}
      

        <div className="login-term">
          <input type="checkbox" name="" id="" />
          <p>Agree to the terms of use & privacy</p>
        </div>

        <div className="login-forgot">

          {currState == 'Login'? <p className="login-toggle">
            Don't have an account?{" "}
            <span onClick={()=>setcurrState('Sign Up')}>Create an account</span>
          </p>: <p className="login-toggle">
            Already have an account?{" "}
            <span onClick={()=>setcurrState('Login')}>Click here</span>
          </p>
          }
          {currState === "Login"? <p className="login-toggle">Forgot password ? <span onClick={()=>resetPass(email)}
            >Reset here</span>
            </p>: null}
        </div>
      </form>
    </div>
  );
};

export default Login;

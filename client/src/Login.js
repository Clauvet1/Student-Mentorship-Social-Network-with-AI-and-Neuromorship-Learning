import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "./Usercontext";
import { getApiUrl } from "./config";
import loginImage from "./assets/images/loginp.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(getApiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.token) {
        alert("Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      login();

      // Decode JWT to get user role
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const userRole = payload.role || "";
      
      // Redirect based on role
      if (userRole === "mentor") {
        navigate("/mentorProfile");
      } else {
        navigate("/studentProfile");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <center>
      <div className="login-container rounded-5 mb-4 col-lg-8 col-md-6 col-sm-9">
        <div className="row w-100">
          <div className="col-lg-6">
            <img className="w-100" src={loginImage} />
          </div>

          <div className="col-lg-6">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />

              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
              />

              <center>
                <button className="m-2 w-50 px-5 rounded-2">
                  Login
                </button>
              </center>
            </form>

            <div className="py-3">
              <p>No account?</p>
              <Link className="loginLinks" to="/signup">Signup here</Link>
            </div>
          </div>
        </div>
      </div>
    </center>
  );
};

export default Login;

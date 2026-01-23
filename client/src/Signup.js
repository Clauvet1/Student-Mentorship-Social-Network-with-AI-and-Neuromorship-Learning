import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "./config";
import loginImage from "./assets/images/female.png";

const Signup = () => {
  const [role, setRole] = useState("mentor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = { name, email, password, role, specialty, bio };

    const res = await fetch(getApiUrl("/api/signup"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (res.ok) navigate("/login");
    else alert("Signup failed");
  };

  return (
    <center className="mb-5">
      <div className="login-container rounded-5 mb-5 mt-5 col-lg-8">
        <div className="row w-100">
          <div className="col-lg-6 px-5">
            <img className="w-100" src={loginImage} alt="" />
          </div>

          <div className="col-lg-6">
            <h1>Signup</h1>

            <div className="user-type">
              <button className={role==="mentor"?"active":""} onClick={()=>setRole("mentor")}>Mentor</button>
<button className={role==="student"?"active":""} onClick={()=>setRole("student")}>Student</button>
            </div>

            <form onSubmit={handleSubmit}>
              <input className="login-input" placeholder="Full Name" onChange={e=>setName(e.target.value)} />
              <input className="login-input" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
              <input type="password" className="login-input" placeholder="Password" onChange={e=>setPassword(e.target.value)} />

              {role==="mentor" && (
                <>
                  <input className="login-input" placeholder="Specialty" onChange={e=>setSpecialty(e.target.value)} />
                  <input className="login-input" placeholder="Bio" onChange={e=>setBio(e.target.value)} />
                </>
              )}

              <center>
                <button className="m-2 w-50 px-5 rounded-2 mt-5">Signup</button>
              </center>
            </form>
          </div>
        </div>
      </div>
    </center>
  );
};

export default Signup;

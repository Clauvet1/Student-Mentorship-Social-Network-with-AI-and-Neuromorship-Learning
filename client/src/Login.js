import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "./Usercontext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("mentors");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userType }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      login();
      userType === "mentors"
        ? navigate("/mentorProfile")
        : navigate("/menteeProfile");
    }
  };
};
export default Login
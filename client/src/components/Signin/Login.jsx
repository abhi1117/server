import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../Public/logo.png";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  superAdminAction,
  superAdminSelector,
  userId,
} from "../../redux/reducers/superAdminReducer";

/*
const AvoidNavtoLogin = () => {
  const navigate = useNavigate();
  const role=useSelector(superAdminSelector);
  const getUserId=useSelector(userId);
  if(getUserId){
    if(role="Super Admin"){
      navigate('/cards')
    }else if(role=="Admin"){
      navigate('/admincards')
    }else{
      navigate('/homepage')
    }
  }else{
    navigate('/login')
  }
 
}
*/

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  //ADDED NEW STATE.
  const [user, setUser] = useState(null);

  const dispatch = useDispatch();
  const role = useSelector(superAdminSelector);
  const getUserId = useSelector(userId);

  useEffect(() => {
    console.log("Logging running");
    if (getUserId) {
      console.log(getUserId);
      if (role === "Super Admin") {
        navigate("/cards");
      } else if (role === "Admin") {
        navigate("/admincards");
      } else {
        navigate("/homepage");
      }
    } else {
      navigate("/login");
    }
  }, [getUserId, role, navigate]);

  const handleChange = useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const validate = useCallback(() => {
    const errors = {};
    if (!formData.emailOrPhone) {
      errors.emailOrPhone = "Email or Phone is required.";
    } else if (
      !/\S+@\S+\.\S+/.test(formData.emailOrPhone) &&
      !/^\d+$/.test(formData.emailOrPhone)
    ) {
      errors.emailOrPhone = "Invalid Email or Phone.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    return errors;
  }, [formData]);

  //LOGIN NEW CODE.

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        // Attempt login with all endpoints in parallel
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        const loginEndpoints = [
          {
            role: "Super Admin",
            endpoint: "superadmins/login",
            dashboard: "/cards",
          },
          {
            role: "Admin",
            endpoint: "admins/login",
            dashboard: "/admincards",
          },
          {
            role: "Program Manager",
            endpoint: "programmanagers/login",
            dashboard: "/homepage",
          },
        ];
        const loginPromises = loginEndpoints.map(
          ({ role, endpoint, dashboard }) =>
            axios
              .post(
                `${API_BASE_URL}/api/${endpoint}`,
                {
                  email: formData.emailOrPhone,
                  password: formData.password,
                  role, // Ensure the role value matches exactly with the server validation
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                  withCredentials: true, // Make sure cookies are included
                }
              )
              .then(async (response) => {
                // console.log('endpoints:',dashboard);
                if (response.status === 200) {
                  const userData = response.data.user;
                  // console.log('userdata:',response.data.id);
                  setUser(userData);
                  navigate(dashboard);
                  dispatch(superAdminAction.updateRole(response.data.role));
                  dispatch(superAdminAction.updateToken(response.data.token));
                  dispatch(superAdminAction.updateId(response.data.id));
                  return { success: true };
                }
              })
              .catch((err) => {
                if (err.response && err.response.status === 403) {
                  setErrors({ general: "Your account is disabled." });
                } else {
                  setErrors({
                    general: "Invalid Credentials or Account Disabled",
                  });
                }
                return { success: false };
              })
        );

        const results = await Promise.race(loginPromises);

        // Check if any login attempt succeeded
        if (!results.some((result) => result.success)) {
          setErrors({ general: "Invalid Credentials or Account Disabled" });
        }
      } catch (err) {
        console.error(err);
        setErrors({ general: "Invalid Credentials or Account Disabled" });
      }
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prevState) => !prevState);
  }, []);

  const handleRememberMeChange = useCallback(() => {
    setRememberMe((prevState) => !prevState);
  }, []);

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="form">
          <h2>Sign in</h2>
          <div className="form-group">
            <label htmlFor="emailOrPhone">Email/Phone</label>
            <input
              type="text"
              name="emailOrPhone"
              id="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
            />
            {errors.emailOrPhone && (
              <div className="error">{errors.emailOrPhone}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={togglePasswordVisibility}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  style={{ marginTop: "10px" }}
                ></i>
              </button>
            </div>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <button type="submit">Sign In</button>
          {errors.general && <div className="error">{errors.general}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;

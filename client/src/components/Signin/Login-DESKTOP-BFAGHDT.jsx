import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Ensure you have the necessary CSS styles as in 'Signin.css'
import logo from "../Public/logo.png"; // Adjust path as needed
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "Super Admin", // Add role to state
    emailOrPhone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Remember Me state

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const endpoint =
          formData.role === "Super Admin"
            ? "superadmins/login"
            : "admins/login";
        const response = await axios.post(
          `https://incubator.drishticps.org/api/${endpoint}`,
          {
            email: formData.emailOrPhone,
            password: formData.password,
            role: formData.role,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          localStorage.setItem("token", response.data.token);
          switch (formData.role) {
            case "Super Admin":
              navigate("/superadmindash");
              break;
            case "Admin":
              navigate("/admindash");
              break;
            case "Program Manager":
              navigate("/programmanagerdash");
              break;
            case "Startup":
              navigate("/startupdash");
              break;
            default:
              navigate("/login");
              break;
          }
        } else {
          setErrors({ general: response.data.msg });
        }
      } catch (err) {
        console.error(err);
        setErrors({ general: "Invalid Credentials" });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="form">
          <h2>Sign in {formData.role}</h2>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Program Manager">Program Manager</option>
              <option value="Startup">Startup</option>
            </select>
          </div>
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
                ></i>
              </button>
            </div>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <div className="additional-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />
              Remember Me
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={() => navigate("/forgetpass")}
            >
              Forgot Password?
            </a>
          </div>
          <button type="submit">Sign In</button>
          {errors.general && <div className="error">{errors.general}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Login.css"; // Ensure you have the necessary CSS styles as in 'Signin.css'
// import logo from "../Public/logo.png"; // Adjust path as needed
// import "@fortawesome/fontawesome-free/css/all.css";
// import axios from "axios";

// const Login = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     role: "Admin", // Default role
//     emailOrPhone: "",
//     password: ""
//   });

//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false); // Remember Me state

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const validate = () => {
//     const errors = {};
//     if (!formData.emailOrPhone) {
//       errors.emailOrPhone = "Email or Phone is required.";
//     } else if (!/\S+@\S+\.\S+/.test(formData.emailOrPhone) && !/^\d+$/.test(formData.emailOrPhone)) {
//       errors.emailOrPhone = "Invalid Email or Phone.";
//     }

//     if (!formData.password) {
//       errors.password = "Password is required.";
//     } else if (formData.password.length < 6) {
//       errors.password = "Password must be at least 6 characters.";
//     }

//     return errors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//     } else {
//       try {
//         const endpoint = 'admins/login';

//         console.log("Sending data to:", `https://incubator.drishticps.org/api/${endpoint}`);
//         console.log("Data:", {
//           email: formData.emailOrPhone,
//           password: formData.password,
//           role: formData.role
//         });

//         const response = await axios.post(`https://incubator.drishticps.org/api/${endpoint}`, {
//           email: formData.emailOrPhone,
//           password: formData.password,
//           role: formData.role
//         }, {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });

//         if (response.status === 200) {
//           localStorage.setItem('token', response.data.token);
//           const redirectRoute = {
//             'Admin': '/admindash',
//             'Super Admin': '/superadmindash',
//             'Program Manager': '/programmanagerdash',
//             'Startup': '/startupdash'
//           }[formData.role];
//           navigate(redirectRoute);
//         } else {
//           setErrors({ general: response.data.msg });
//         }
//       } catch (err) {
//         console.error('Login Error:', err.response || err);
//         setErrors({ general: err.response?.data?.msg || 'Invalid Credentials' });
//       }
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleRememberMeChange = () => {
//     setRememberMe(!rememberMe);
//   };

//   return (
//     <div className="login-page">
//       <div className="logo-container">
//         <img src={logo} alt="Logo" className="logo" />
//       </div>
//       <div className="login-container">
//         <form onSubmit={handleSubmit} className="form">
//           <h2>Sign in {formData.role}</h2>
//           <div className="form-group">
//             <label htmlFor="role">Role</label>
//             <select
//               name="role"
//               id="role"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Admin">Admin</option>
//               <option value="Super Admin">Super Admin</option>
//               <option value="Program Manager">Program Manager</option>
//               <option value="Startup">Startup</option>
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="emailOrPhone">Email/Phone</label>
//             <input
//               type="text"
//               name="emailOrPhone"
//               id="emailOrPhone"
//               value={formData.emailOrPhone}
//               onChange={handleChange}
//               required
//             />
//             {errors.emailOrPhone && <div className="error">{errors.emailOrPhone}</div>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <div className="password-input-container">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 id="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//               <button type="button" className="toggle-password-visibility" onClick={togglePasswordVisibility}>
//                 <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
//               </button>
//             </div>
//             {errors.password && <div className="error">{errors.password}</div>}
//           </div>
//           <div className="additional-options">
//             <label className="remember-me">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={handleRememberMeChange}
//               />
//               Remember Me
//             </label>
//             <a href="#" className="forgot-password" onClick={() => navigate("/forgetpass")}>
//               Forgot Password?
//             </a>
//           </div>
//           <button type="submit">Sign In</button>
//           {errors.general && <div className="error">{errors.general}</div>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

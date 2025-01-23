import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserSignIn.css";
import logo from "../Public/logo.png";
import "@fortawesome/fontawesome-free/css/all.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserSignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false); // To toggle OTP input
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otpVerified, setOtpVerified] = useState(false); // Track if OTP is verified
  const [tab, setTab] = useState("password"); // New state for tab selection
  const [forgotPassword, setForgotPassword] = useState(false); // For Forgot Password flow
  // *** START CHANGE FOR OTP expiration and resend functionality ***
  const [otpExpired, setOtpExpired] = useState(false); // Track OTP expiration
  const [otpTimer, setOtpTimer] = useState(null); // Timer for OTP expiration

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

    if (!showOtpInput && !formData.password && tab === "password") {
      errors.password = "Password is required.";
    } else if (
      !showOtpInput &&
      formData.password.length < 6 &&
      tab === "password"
    ) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (showOtpInput && !formData.otp && tab === "otp") {
      errors.otp = "OTP is required.";
    }

    return errors;
  }, [formData, showOtpInput, tab]);

  const handleOtpRequest = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      await axios.post(`${API_BASE_URL}/api/users/register`, {
        email: formData.emailOrPhone,
      });

      setOtpSent(true);
      setShowOtpInput(true); // Show OTP input field once OTP is sent
      toast.success("OTP sent to your email!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Start OTP expiration timer (set to 10 minutes in milliseconds)
      const timer = setTimeout(() => {
        setOtpExpired(true);
        toast.error(
          "OTP has expired. for new OTP Please press 'Resend OTP' button.",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
          }
        );
      }, 10 * 60 * 1000); // 10 minutes

      setOtpTimer(timer);
    } catch (error) {
      // Show error message using Toastify
      toast.error("OTP already sent. Please check your email.", {
        position: "bottom-right",
        autoClose: 5000, // Auto close after 5 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL ||
          "https://incubator.drishticps.org";

        if (showOtpInput || tab === "otp") {
          // Handle OTP verification and password send
          console.log(
            "Verifying OTP with:",
            formData.emailOrPhone,
            formData.otp
          );
          const response = await axios.post(
            `${API_BASE_URL}/api/users/verify-otp`,
            {
              email: formData.emailOrPhone,
              otp: formData.otp,
            }
          );

          console.log("OTP verification response:", response);

          if (response.status === 200) {
            console.log(
              "OTP successfully verified. Switching to password tab."
            );
            // Highlight: Switch to password tab and clear OTP-related state
            clearTimeout(otpTimer); // Clear timer if OTP is verified
            setTab("password");
            setShowOtpInput(false);
            setOtpSent(false);
            setOtpExpired(false); // Reset expired state
            setFormData((prevData) => ({
              ...prevData,
              otp: "", // Clear OTP field
            }));
            toast.success("OTP verified! Password sent to your email.", {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          } else {
            // *** START CHANGE FOR OTP expiration message ***
            if (
              response.data.msg ===
              "OTP is either invalid or has expired. Please try again."
            ) {
              setOtpExpired(true); // Set OTP expired flag
              console.log("OTP expired. Showing 'Resend OTP' button."); // Debugging

              toast.error(
                "OTP has expired. for new OTP Please press 'Resend OTP' button.",
                {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                }
              );
            } else {
              toast.error(
                response.data.msg ||
                  "OTP verification failed. Please try again.",
                {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                }
              );
            }
            // *** END CHANGE FOR OTP expiration message ***
          }
        } else {
          // Handle regular login with password
          console.log(
            "Logging in with email:",
            formData.emailOrPhone,
            "and password:",
            formData.password
          );
          const loginResponse = await axios.post(
            `${API_BASE_URL}/api/users/login`,
            {
              email: formData.emailOrPhone,
              password: formData.password,
            },
            { withCredentials: true }
          );

          console.log("Login response:", loginResponse);

          if (loginResponse.status === 200) {
            console.log("Login successful. Redirecting to user dashboard.");
            navigate("/userdashboard");
          } else {
            console.log("Login failed:", loginResponse.data);
            toast.error("Invalid Credentials", {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        }
      } catch (err) {
        console.error("Error during login/OTP verification:", err);
        toast.error(
          err.response?.data?.msg || "Invalid Credentials or OTP expired",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
      }
    }
  };

  // ** Forgot Password functionality ***
  const handleForgotPasswordOtpRequest = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      await axios.post(`${API_BASE_URL}/api/users/forgot-password`, {
        email: formData.emailOrPhone,
      });

      setOtpSent(true); // OTP sent for Forgot Password
      toast.success("OTP sent to reset your password!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      const timer = setTimeout(() => {
        setOtpExpired(true);
        toast.error("OTP has expired. Please press 'Resend OTP' button.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }, 10 * 60 * 1000); // 10 minutes

      setOtpTimer(timer);
    } catch (error) {
      toast.error("Error sending OTP. Please try again.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      // Send OTP and reset password
      const response = await axios.post(
        `${API_BASE_URL}/api/users/verify-forgot-password-otp`,
        {
          email: formData.emailOrPhone,
          otp: formData.otp,
        }
      );

      if (response.status === 200) {
        toast.success("Password sent to your email.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        // Handle expired OTP message and show 'Resend OTP' button for Forgot Password
        if (
          response.data.msg ===
          "OTP is either invalid or has expired. Please try again."
        ) {
          setOtpExpired(true); // Mark OTP as expired
          toast.error("OTP has expired. Please press 'Resend OTP' button.", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error("OTP verification failed.", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    } catch (error) {
      toast.error("OTP verification failed. Please try again.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleResendForgotPasswordOtp = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      await axios.post(`${API_BASE_URL}/api/users/resend-otp`, {
        email: formData.emailOrPhone,
      });

      toast.success("New OTP sent to your email!", {
        position: "bottom-right",
        autoClose: 5000,
      });
      setOtpExpired(false); // Reset OTP expiration state after resending OTP
      setOtpSent(true); // Mark OTP as re-sent

      // Start new OTP expiration timer for Forgot Password
      const newTimer = setTimeout(() => {
        setOtpExpired(true);
        toast.error("OTP has expired. Please press 'Resend OTP' button.", {
          position: "bottom-right",
          autoClose: 5000,
        });
      }, 10 * 60 * 1000); // 10 minutes for new OTP

      setOtpTimer(newTimer);
    } catch (error) {
      toast.error("Error sending new OTP. Please try again.", {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  // *** START CHANGE FOR OTP expiration and resend functionality ***

  const handleResendOtp = async () => {
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL ||
        "https://incubator.drishticps.org";

      await axios.post(`${API_BASE_URL}/api/users/resend-otp`, {
        email: formData.emailOrPhone,
      });

      toast.success("New OTP sent to your email!", {
        position: "bottom-right",
        autoClose: 5000,
      });
      setOtpExpired(false); // Reset OTP expiration state after resending OTP
      setShowOtpInput(true); // Keep showing OTP input field
      setOtpSent(true); // OTP has been re-sent

      // Start new OTP expiration timer
      const newTimer = setTimeout(() => {
        setOtpExpired(true);
        toast.error(
          "OTP has expired. for new OTP Please press 'Resend OTP' button.",
          {
            position: "bottom-right",
            autoClose: 5000,
          }
        );
      }, 10 * 60 * 1000); // 10 minutes for new OTP
      setOtpTimer(newTimer);
    } catch (error) {
      toast.error("Error sending new OTP. Please try again.", {
        position: "bottom-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    return () => {
      // Clean up the timer when component unmounts
      if (otpTimer) clearTimeout(otpTimer);
    };
  }, [otpTimer]);

  // *** END CHANGE FOR OTP expiration and resend functionality ***
  return (
    <div className="login-page-usersignin">
      <div className="logo-container-usersignin">
        <img src={logo} alt="Logo" className="logo-usersignin" />
      </div>
      <div className="login-container-usersignin">
        {!forgotPassword ? (
          <form onSubmit={handleSubmit} className="form-usersignin">
            <h2>Sign in</h2>

            {/* Start - Tab Button for switching between Password and OTP */}
            <div className="tab-container-usersignin">
              <button
                type="button"
                className={`tab-button-usersignin ${
                  tab === "password" ? "active" : ""
                }`}
                onClick={() => {
                  setTab("password");
                  setShowOtpInput(false);
                }}
              >
                With Password
              </button>
              <button
                type="button"
                className={`tab-button-usersignin ${
                  tab === "otp" ? "active" : ""
                }`}
                onClick={() => {
                  setTab("otp");
                  setShowOtpInput(false); // Reset OTP input visibility
                  setOtpSent(false); // Reset OTP sent state
                }}
              >
                With OTP
              </button>
            </div>
            {/* End - Tab Button for switching between Password and OTP */}

            <div className="form-group-usersignin">
              <label htmlFor="emailOrPhone">Email</label>
              <input
                type="text"
                name="emailOrPhone"
                id="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              {errors.emailOrPhone && (
                <div className="error-usersignin">{errors.emailOrPhone}</div>
              )}
            </div>

            {/* Start - Conditional rendering based on tab */}
            {tab === "password" && (
              <>
                <div className="form-group-usersignin">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-container-usersignin">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-visibility-usersignin"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-usersignin">{errors.password}</div>
                  )}
                </div>

                {/* Forgot Password link */}
                <p
                  className="forgot-password-link-usersignin"
                  onClick={() => setForgotPassword(true)}
                >
                  Forgot password?
                </p>

                <div className="button-group-usersignin">
                  <button type="submit" className="button-submit-usersignin">
                    Sign In
                  </button>
                </div>
              </>
            )}

            {tab === "otp" && (
              <>
                {otpSent ? (
                  <>
                    <div className="form-group-usersignin">
                      <label htmlFor="otp">OTP</label>
                      <input
                        type="text"
                        name="otp"
                        id="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter the OTP sent to your email"
                        required
                      />
                      {errors.otp && (
                        <div className="error-usersignin">{errors.otp}</div>
                      )}
                    </div>
                    {/* <div className="button-group-usersignin">  */}
                    <div
                      className={`button-group-usersignin ${
                        otpExpired ? "button-group-side-by-side" : ""
                      }`}
                    >
                      {/* START - Resend OTP option */}
                      {otpExpired && (
                        <button
                          type="button"
                          className="resend-button-submit-usersignin"
                          onClick={handleResendOtp}
                        >
                          Resend OTP
                        </button>
                      )}
                      {/* END - Resend OTP option */}

                      <button
                        type="submit"
                        className="button-submit-usersignin"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="button-group-usersignin">
                    <button
                      type="button"
                      className="button-otp-usersignin"
                      onClick={handleOtpRequest}
                    >
                      Send OTP
                    </button>
                  </div>
                )}
              </>
            )}
            {/* End - Conditional rendering based on tab */}

            {errors.general && (
              <div className="error-usersignin">{errors.general}</div>
            )}
          </form>
        ) : (
          <form
            onSubmit={handleForgotPasswordSubmit}
            className="form-forgot-password-usersignin"
          >
            <h2 className="forgot-password-heading-usersignin">
              Forgot Password
            </h2>

            <div className="form-group-usersignin">
              <label htmlFor="emailOrPhone">E-mail</label>
              <input
                type="text"
                name="emailOrPhone"
                id="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                placeholder="Enter your email to reset password"
                required
              />
              {errors.emailOrPhone && (
                <div className="error-usersignin">{errors.emailOrPhone}</div>
              )}
            </div>

            {otpSent ? (
              <>
                <div className="form-group-usersignin">
                  <label htmlFor="otp">OTP</label>
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter the OTP sent to your email"
                    required
                  />
                </div>
                <div
                  className={`button-group-usersignin ${
                    otpExpired ? "button-group-side-by-side" : ""
                  }`}
                >
                  {/* START - Resend OTP button for forgot password */}
                  {otpExpired && (
                    <button
                      type="button"
                      className="resend-button-submit-usersignin"
                      onClick={handleResendForgotPasswordOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                  {/* END - Resend OTP button for forgot password */}

                  <button type="submit" className="button-submit-usersignin">
                    Verify OTP
                  </button>
                </div>
              </>
            ) : (
              <div className="button-group-usersignin">
                <button
                  type="button"
                  className="button-otp-usersignin"
                  onClick={handleForgotPasswordOtpRequest}
                >
                  Send OTP
                </button>
              </div>
            )}
            <p
              className="back-to-login-link-usersignin"
              onClick={() => setForgotPassword(false)}
            >
              Sign In
            </p>
          </form>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default UserSignIn;

////////no forger password

// import React, { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import "./UserSignIn.css";
// import logo from "../Public/logo.png";
// import "@fortawesome/fontawesome-free/css/all.css";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const UserSignIn = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     emailOrPhone: "",
//     password: "",
//     otp: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [showOtpInput, setShowOtpInput] = useState(false);  // To toggle OTP input
//   const [otpSent, setOtpSent] = useState(false);  // Track if OTP has been sent
//   const [otpVerified, setOtpVerified] = useState(false);  // **NEW** Track if OTP is verified
//   const [tab, setTab] = useState("password"); // New state for tab selection

//   const handleChange = useCallback((e) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [e.target.name]: e.target.value,
//     }));
//   }, []);

//   const validate = useCallback(() => {
//     const errors = {};
//     if (!formData.emailOrPhone) {
//       errors.emailOrPhone = "Email or Phone is required.";
//     } else if (
//       !/\S+@\S+\.\S+/.test(formData.emailOrPhone) &&
//       !/^\d+$/.test(formData.emailOrPhone)
//     ) {
//       errors.emailOrPhone = "Invalid Email or Phone.";
//     }

//     if (!showOtpInput && !formData.password && tab === "password") {
//       errors.password = "Password is required.";
//     } else if (!showOtpInput && formData.password.length < 6 && tab === "password") {
//       errors.password = "Password must be at least 6 characters.";
//     }

//     if (showOtpInput && !formData.otp && tab === "otp") {
//       errors.otp = "OTP is required.";
//     }

//     return errors;
//   }, [formData, showOtpInput, tab]);

//   const handleOtpRequest = async () => {
//     try {
//       const API_BASE_URL =
//         process.env.REACT_APP_API_BASE_URL || "https://incubator.drishticps.org";

//       await axios.post(`${API_BASE_URL}/api/users/register`, {
//         email: formData.emailOrPhone,
//       });

//       setOtpSent(true);
//       setShowOtpInput(true); // Show OTP input field once OTP is sent
//       toast.success("OTP sent to your email!", {
//         position: "bottom-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
//     } catch (error) {
//       // Show error message using Toastify
//       toast.error("OTP already sent. Please check your email.", {
//         position: "bottom-right",
//         autoClose: 5000, // Auto close after 5 seconds
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
//     }
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//     } else {
//       try {
//         const API_BASE_URL =
//           process.env.REACT_APP_API_BASE_URL || "https://incubator.drishticps.org";

//         if (showOtpInput || tab === "otp") {
//           // Handle OTP verification and password send
//           console.log("Verifying OTP with:", formData.emailOrPhone, formData.otp);
//           const response = await axios.post(`${API_BASE_URL}/api/users/verify-otp`, {
//             email: formData.emailOrPhone,
//             otp: formData.otp,
//           });

//           console.log("OTP verification response:", response);

//           if (response.status === 200) {
//             console.log("OTP successfully verified. Switching to password tab.");
//             // Highlight: Switch to password tab and clear OTP-related state
//             setTab("password");
//             setShowOtpInput(false);
//             setOtpSent(false);
//             setFormData((prevData) => ({
//               ...prevData,
//               otp: "", // Clear OTP field
//             }));
//             toast.success("OTP verified! Password sent to your email.", {
//               position: "bottom-right",
//               autoClose: 5000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               progress: undefined,
//             });
//           } else {
//             console.log("OTP verification failed:", response.data);
//             toast.error(response.data.msg || "OTP verification failed. Please try again.", {
//               position: "bottom-right",
//               autoClose: 5000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               progress: undefined,
//             });
//           }
//         } else {
//           // Handle regular login with password
//           console.log("Logging in with email:", formData.emailOrPhone, "and password:", formData.password);
//           const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
//             email: formData.emailOrPhone,
//             password: formData.password,
//           });

//           console.log("Login response:", loginResponse);

//           if (loginResponse.status === 200) {
//             console.log("Login successful. Redirecting to user dashboard.");
//             navigate("/userdashboard");
//           } else {
//             console.log("Login failed:", loginResponse.data);
//             // setErrors({ general: "Invalid Credentials or Account Disabled" });
//             toast.error("Invalid Credentials", {
//               position: "bottom-right",
//               autoClose: 5000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               progress: undefined,
//             });
//           }
//         }
//       } catch (err) {
//         console.error("Error during login/OTP verification:", err);
//         // setErrors({ general: "Invalid Credentials or Account Disabled" });
//         toast.error(err.response?.data?.msg || "Invalid Credentials or OTP expired", {
//           position: "bottom-right",
//           autoClose: 5000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//         });
//       }
//     }
//   };

// // End - Add detailed logging to identify the issue with login flow

//   return (
//     <div className="login-page-usersignin">
//       <div className="logo-container-usersignin">
//         <img src={logo} alt="Logo" className="logo-usersignin" />
//       </div>
//       <div className="login-container-usersignin">
//         <form onSubmit={handleSubmit} className="form-usersignin">
//           <h2>Sign in</h2>

//           {/* Start - Tab Button for switching between Password and OTP */}
//           <div className="tab-container-usersignin">
//             <button
//               type="button"
//               className={`tab-button-usersignin ${tab === "password" ? "active" : ""}`}
//               onClick={() => {
//                 setTab("password");
//                 setShowOtpInput(false);
//               }}
//             >
//               With Password
//             </button>
//             <button
//               type="button"
//               className={`tab-button-usersignin ${tab === "otp" ? "active" : ""}`}
//               onClick={() => {
//                 setTab("otp");
//                 setShowOtpInput(true);
//               }}
//             >
//               With OTP
//             </button>
//           </div>
//           {/* End - Tab Button for switching between Password and OTP */}

//           <div className="form-group-usersignin">
//             <label htmlFor="emailOrPhone">Email</label>
//             <input
//               type="text"
//               name="emailOrPhone"
//               id="emailOrPhone"
//               value={formData.emailOrPhone}
//               onChange={handleChange}
//               required
//             />
//             {errors.emailOrPhone && (
//               <div className="error-usersignin">{errors.emailOrPhone}</div>
//             )}
//           </div>

//           {/* Start - Conditional rendering based on tab */}
//           {tab === "password" && (
//             <>
//               <div className="form-group-usersignin">
//                 <label htmlFor="password">Password</label>
//                 <div className="password-input-container-usersignin">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     id="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="toggle-password-visibility-usersignin"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                   >
//                     <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} ></i>
//                   </button>
//                 </div>
//                 {errors.password && <div className="error-usersignin">{errors.password}</div>}
//               </div>

//               <div className="button-group-usersignin">
//                 <button type="submit" className="button-submit-usersignin">
//                   Sign In
//                 </button>
//               </div>
//             </>
//           )}

//           {tab === "otp" && (
//             <>
//               {otpSent ? (
//                 <>
//                   <div className="form-group-usersignin">
//                     <label htmlFor="otp">OTP</label>
//                     <input
//                       type="text"
//                       name="otp"
//                       id="otp"
//                       value={formData.otp}
//                       onChange={handleChange}
//                       required
//                     />
//                     {errors.otp && <div className="error-usersignin">{errors.otp}</div>}
//                   </div>
//                   <div className="button-group-usersignin">
//                     <button type="submit" className="button-submit-usersignin">
//                       Verify OTP
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="button-group-usersignin">
//                   <button
//                     type="button"
//                     className="button-otp-usersignin"
//                     onClick={handleOtpRequest}
//                   >
//                     Send OTP
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//           {/* End - Conditional rendering based on tab */}

//           {errors.general && (
//             <div className="error-usersignin">{errors.general}</div>
//           )}
//         </form>
//       </div>

//       {/* Toast Container for displaying error messages */}
//       <ToastContainer />
//     </div>
//   );
// };

// export default UserSignIn;

////////refresh is required for login

// import React, { useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import "./UserSignIn.css";
// import logo from "../Public/logo.png";
// import "@fortawesome/fontawesome-free/css/all.css";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const UserSignIn = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     emailOrPhone: "",
//     password: "",
//     otp: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [showOtpInput, setShowOtpInput] = useState(false);  // To toggle OTP input
//   const [otpSent, setOtpSent] = useState(false);  // Track if OTP has been sent
//   const [tab, setTab] = useState("password"); // New state for tab selection

//   const handleChange = useCallback((e) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [e.target.name]: e.target.value,
//     }));
//   }, []);

//   const validate = useCallback(() => {
//     const errors = {};
//     if (!formData.emailOrPhone) {
//       errors.emailOrPhone = "Email or Phone is required.";
//     } else if (
//       !/\S+@\S+\.\S+/.test(formData.emailOrPhone) &&
//       !/^\d+$/.test(formData.emailOrPhone)
//     ) {
//       errors.emailOrPhone = "Invalid Email or Phone.";
//     }

//     if (!showOtpInput && !formData.password && tab === "password") {
//       errors.password = "Password is required.";
//     } else if (!showOtpInput && formData.password.length < 6 && tab === "password") {
//       errors.password = "Password must be at least 6 characters.";
//     }

//     if (showOtpInput && !formData.otp && tab === "otp") {
//       errors.otp = "OTP is required.";
//     }

//     return errors;
//   }, [formData, showOtpInput, tab]);

//   const handleOtpRequest = async () => {
//     try {
//       const API_BASE_URL =
//         process.env.REACT_APP_API_BASE_URL || "https://incubator.drishticps.org";

//       await axios.post(`${API_BASE_URL}/api/users/register`, {
//         email: formData.emailOrPhone,
//       });

//       setOtpSent(true);
//       setShowOtpInput(true); // Show OTP input field once OTP is sent
//       toast.success("OTP sent to your email!", {
//         position: "bottom-right",
//         autoClose: 5000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
//     } catch (error) {
//       // Show error message using Toastify
//       toast.error("OTP already sent. Please check your email.", {
//         position: "bottom-right",
//         autoClose: 5000, // Auto close after 5 seconds
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//     } else {
//       try {
//         const API_BASE_URL =
//           process.env.REACT_APP_API_BASE_URL || "https://incubator.drishticps.org";

//         if (showOtpInput || tab === "otp") {
//           // Handle OTP verification and password send
//           const response = await axios.post(`${API_BASE_URL}/api/users/verify-otp`, {
//             email: formData.emailOrPhone,
//             otp: formData.otp,
//           });

//           // Use the response to check the success or failure of OTP verification
//           if (response.status === 200) {
//             // OTP verified successfully
//             toast.success("OTP verified! Password sent to your email.", {
//               position: "bottom-right",
//               autoClose: 5000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               progress: undefined,
//             });
//             setTab("password");  // Switch to password tab after successful OTP verification
//           } else {
//             // Handle the case where OTP verification fails
//             toast.error(response.data.msg || "OTP verification failed. Please try again.", {
//               position: "bottom-right",
//               autoClose: 5000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               progress: undefined,
//             });
//           }
//         } else {
//           // Handle regular login with password
//           await axios.post(`${API_BASE_URL}/api/users/login`, {
//             email: formData.emailOrPhone,
//             password: formData.password,
//           });
//           navigate("/userdashboard");
//         }
//       } catch (err) {
//         setErrors({ general: "Invalid Credentials or Account Disabled" });
//       }
//     }
//   };

//   return (
//     <div className="login-page-usersignin">
//       <div className="logo-container-usersignin">
//         <img src={logo} alt="Logo" className="logo-usersignin" />
//       </div>
//       <div className="login-container-usersignin">
//         <form onSubmit={handleSubmit} className="form-usersignin">
//           <h2>Sign in</h2>

//           {/* Start - Tab Button for switching between Password and OTP */}
//           <div className="tab-container-usersignin">
//             <button
//               type="button"
//               className={`tab-button-usersignin ${tab === "password" ? "active" : ""}`}
//               onClick={() => {
//                 setTab("password");
//                 setShowOtpInput(false);
//               }}
//             >
//               With Password
//             </button>
//             <button
//               type="button"
//               className={`tab-button-usersignin ${tab === "otp" ? "active" : ""}`}
//               onClick={() => {
//                 setTab("otp");
//                 setShowOtpInput(true);
//               }}
//             >
//               With OTP
//             </button>
//           </div>
//           {/* End - Tab Button for switching between Password and OTP */}

//           <div className="form-group-usersignin">
//             <label htmlFor="emailOrPhone">Email</label>
//             <input
//               type="text"
//               name="emailOrPhone"
//               id="emailOrPhone"
//               value={formData.emailOrPhone}
//               onChange={handleChange}
//               required
//             />
//             {errors.emailOrPhone && (
//               <div className="error-usersignin">{errors.emailOrPhone}</div>
//             )}
//           </div>

//           {/* Start - Conditional rendering based on tab */}
//           {tab === "password" && (
//             <>
//               <div className="form-group-usersignin">
//                 <label htmlFor="password">Password</label>
//                 <div className="password-input-container-usersignin">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     id="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                   />
//                   <button
//                     type="button"
//                     className="toggle-password-visibility-usersignin"
//                     onClick={() => setShowPassword((prev) => !prev)}
//                   >
//                     <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} ></i>
//                   </button>
//                 </div>
//                 {errors.password && <div className="error-usersignin">{errors.password}</div>}
//               </div>

//               <div className="button-group-usersignin">
//                 <button type="submit" className="button-submit-usersignin">
//                   Sign In
//                 </button>
//               </div>
//             </>
//           )}

//           {tab === "otp" && (
//             <>
//               {otpSent ? (
//                 <>
//                   <div className="form-group-usersignin">
//                     <label htmlFor="otp">OTP</label>
//                     <input
//                       type="text"
//                       name="otp"
//                       id="otp"
//                       value={formData.otp}
//                       onChange={handleChange}
//                       required
//                     />
//                     {errors.otp && <div className="error-usersignin">{errors.otp}</div>}
//                   </div>
//                   <div className="button-group-usersignin">
//                     <button type="submit" className="button-submit-usersignin">
//                       Verify OTP
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <div className="button-group-usersignin">
//                   <button
//                     type="button"
//                     className="button-otp-usersignin"
//                     onClick={handleOtpRequest}
//                   >
//                     Send OTP
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//           {/* End - Conditional rendering based on tab */}

//           {errors.general && (
//             <div className="error-usersignin">{errors.general}</div>
//           )}
//         </form>
//       </div>

//       {/* Toast Container for displaying error messages */}
//       <ToastContainer />
//     </div>
//   );
// };

// export default UserSignIn;

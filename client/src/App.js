import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup/Signup.jsx";
import Emailverified from "./components/Emailverified/Emailverified.jsx";
import Forgetpass from "./components/Forgetpassmail/Forgetpassmail.jsx";
import Forgetpassmail from "./components/Forgetpassmail/Forgetpassmail.jsx";
import Changepass from "./components/Changepass/Changepass.jsx";
import Passchanged from "./components/Passchanged/Passchanged.jsx";
import Verifyredirect from "./components/Verifyredirect/Verifyredirect.jsx";
import Startupdetails from "./components/Startupdetails/Startupdetails.jsx";
import Founder from "./components/Founders/Founder.jsx";
import Addnewfounder from "./components/Founders/Addnewfounder/Addnewfounder_1/Addnewfounder.jsx";
import Founderadded from "./components/Founders/Addnewfounder/Founderadded/Founderadded.jsx";
import Foundersdata from "./components/Founders/Foundersdata/Foundersdata.jsx";
import FounderDetails from "./components/Founderdetails/Founderdetails.jsx";
import MisDocs from "./components/Misdocs/Misdocs.jsx";
import Dashboard from "./components/Dashboard_1/Dash.jsx";
import SuperadminDash from "./components/SuperAdmin/Superadmindash.jsx";
import Admindashboard from "./components/Admin/Admindashboard.jsx"; // Use Admindash
import Login from "./components/Signin/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
//IMPORTING STORE.(REDUX)
import {
  OrganizationList,
  CreateOrganization,
  EditOrganization,
  OrganizationDetails,
} from "./components/Organizations/Organizations";
import Superadmincards from "./components/Cards/Superadmincard/Superadmincards.jsx";
import Admincards from "./components/Cards/Admincards/Admincard.jsx"; // Corrected import path

// PM1
import Form from "./components/Form/Form.jsx";
import FormDetails from "./components/Form/FormDetails.jsx";
import FormBuilder from "./components/FormBuilder/FormBuilder.jsx";
import FormPreview from "./components/FormBuilder/FormPreview.jsx";
import EvaluatorForm from "./components/EvaluatorForm/EvaluatorForm.jsx";
import EvaluatorFormPreview from "./components/EvaluatorForm/EvaluatorFormPreview.jsx";
//import EvaluatorFormDetails from "./components/EvaluatorForm/EvaluatorFormDetails.jsx";
//import EvaluationStartup from "./components/EvaluatorForm/EvaluationStartup.jsx";
//import DisplayEvaluatorForm from "./components/EvaluatorForm/DisplayEvaluatorForm.jsx";
//import EvaluationStartupAllDetail from "./components/EvaluatorForm/EvaluationStartupAllDetail.jsx";
import EvaluatorDashboard from "./components/EvaluatorForm/EvaluatorDashboard.jsx";
import SharedFormPreview from "./components/EvaluatorForm/SharedFormPreview.jsx";
import PublicFormPreview from "./components/Form/PublicFormPreview.jsx";
import GeneralFormAllResponses from "./components/Form/GeneralFormAllResponses.jsx";
import Homepage from "./components/Homepage/Homepage";
import Cohorts from "./components/Cohorts/Cohorts";
import EditCohortsModal from "./components/Cohorts/EditCohortsModal";
import ViewCohorts from "./components/Cohorts/ViewCohorts";
import Pipeline from "./components/Pipeline/Pipeline";
import ViewEditPipeline from "./components/Pipeline/ViewEditPipeline";
import Applications from "./components/Applications/Applications.jsx";
import FinalApplicationForm from "./components/FinalApplicationForm/FinalApplicationForm.jsx";

//user
import UserSignIn from "./components/Signin/UserSignIn.jsx";
import UserDashboard from "./components/UserDashboard/UserDashboard.jsx";
import UserDetails from "./components/UserDashboard/UserFormDetails.jsx";

import "./App.css";
import UserFormDetails from "./components/UserDashboard/UserFormDetails.jsx";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  superAdminAction,
  userId,
} from "./redux/reducers/superAdminReducer.js";
import axios from "axios";
//import { useNavigate } from "react-router-dom";

/*
const useAuthInterceptor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          dispatch(superAdminAction.logoutUser()); // Clear user data and token
          alert("Your session has expired. Please log in again."); // Show pop-up message
          navigate('/login'); // Redirect to login page
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor); // Eject interceptor on cleanup
  }, [dispatch, navigate]);
};
*/
function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    console.log("Fetching id and role again in app.js");
    const checkAuth = async () => {
      try {
        // Call the backend endpoint to check authentication
        const response = await axios.get(
          "https://incubator.drishticps.org/api/superadmins/auth/me",
          {
            withCredentials: true, // Include HTTP-only cookie
          }
        );

        // If authenticated, update Redux state with user data
        if (response.status === 200) {
          const { role, id } = response.data;
          // console.log("###:",role,id)
          dispatch(superAdminAction.updateRole(role)); // Dispatch action to update role in store
          dispatch(superAdminAction.updateId(id));
        }
      } catch (error) {
        console.error("User not authenticated:", error);
        // Optionally handle unauthenticated state, e.g., navigate to login page
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    checkAuth(); // Run authentication check on initial load
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>; // Or use a spinner component
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/email-verified" element={<Emailverified />} />
        <Route path="/verifydirect" element={<Verifyredirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgetpass" element={<Forgetpass />} />
        <Route path="/forget-pass-mail" element={<Forgetpassmail />} />
        <Route path="/change-pass" element={<Changepass />} />
        <Route path="/pass-changed" element={<Passchanged />} />
        <Route path="/startup-details" element={<Startupdetails />} />
        <Route path="/Founder" element={<Founder />} />
        <Route path="/Addnewfounder" element={<Addnewfounder />} />
        <Route path="/founder-added" element={<Founderadded />} />
        <Route path="/foundersdata" element={<Foundersdata />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Cards" element={<Superadmincards />} />
        <Route path="/form" element={<Form />} />
        <Route path="/form/:title" element={<FormDetails />} />
        <Route path="/form-builder" element={<FormBuilder />} />
        <Route path="/form-preview" element={<FormPreview />} />
        <Route path="/evaluator-form" element={<EvaluatorForm />} />
        <Route
          path="/evaluator-form-preview"
          element={<EvaluatorFormPreview />}
        />
        <Route path="/evaluator-dashboard" element={<EvaluatorDashboard />} />
        <Route
          path="/shared-form-preview/:formId"
          element={<SharedFormPreview />}
        />
        <Route
          path="/public-form-preview/:formId"
          element={<PublicFormPreview />}
        />
        <Route
          path="/general-form-all-responses/:formId"
          element={<GeneralFormAllResponses />}
        />
        <Route
          path="/general-form-all-responses/:formId"
          element={<GeneralFormAllResponses />}
        />
        <Route
          path="/public-form-preview/:formId"
          element={<PublicFormPreview />}
        />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/cohorts" element={<Cohorts />} />
        <Route path="/edit-cohort/:id" element={<EditCohortsModal />} />
        <Route path="/view-cohort/:id" element={<ViewCohorts />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/vieweditpipeline/:id" element={<ViewEditPipeline />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/fa/:id" element={<FinalApplicationForm />} />
        {/* //user// */}
        <Route path="/user-signin" element={<UserSignIn />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/userformdetails" element={<UserFormDetails />} />
        {/* Protected Routes */}
        <Route path="/superadmindash" element={<SuperadminDash />} />
        <Route path="/admindash" element={<Admindashboard />} />
        <Route path="/admincards" element={<Admincards />} />{" "}
        {/* Added route */}
        <Route
          path="/founder-details/:founderId"
          element={<FounderDetails />}
        />
        <Route path="/Misdocs" element={<MisDocs />} />
        {/* Organization Routes */}
        <Route path="/organizations" element={<OrganizationList />} />
        <Route path="/create-organization" element={<CreateOrganization />} />
        <Route path="/edit-organization/:id" element={<EditOrganization />} />
        <Route
          path="/organization-details/:id"
          element={<OrganizationDetails />}
        />
      </Routes>
    </Router>
  );
}

export default App;

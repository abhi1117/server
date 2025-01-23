import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { CgNotes } from 'react-icons/cg';
import { AiOutlineEye } from 'react-icons/ai';
import { FiMenu } from 'react-icons/fi';
import { RiArrowDropDownLine } from 'react-icons/ri';
import './DisplayEvaluatorForm.css';


const DisplayEvaluatorForm = () => {
  const [formDetails, setFormDetails] = useState(null);

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await axios.get('YOUR_BACKEND_API_URL');
        setFormDetails(response.data);
      } catch (error) {
        console.error('Error fetching form details:', error);
      }
    };

    fetchFormDetails();
  }, []);

  if (!formDetails) {
    return <div>Loading...</div>;
  }

  const fieldNames = formDetails.responses && formDetails.responses.length > 0
    ? Object.keys(formDetails.responses[0])
    : [];

  return (
    <div className="dashboard-formdisplayevaluatorform">
      <aside className="sidebar-displayevaluatorform">
        <div className="logo-container-displayevaluatorform">
          <div className="logo-displayevaluatorform">
            <img src="/navbar/drishtilogo.jpg" alt="Logo" className="dristilogo-displayevaluatorform" />
          </div>
        </div>
        <div className="nav-container-displayevaluatorform">
          <nav className="nav-displayevaluatorform">
            <ul>
              <li>
                <Link to="/form">
                  <CgNotes className="nav-icon-displayevaluatorform" /> General Form
                </Link>
              </li>
              <li>
                <Link to="/evaluation-startup">
                  <AiOutlineEye className="nav-icon-displayevaluatorform" /> Evaluator Form
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="main-content-displayevaluatorform">
        <header className="header-displayevaluatorform">
          <span className="founder-displayevaluatorform">
            <FiMenu style={{ color: '#909090' }} />All Forms
          </span>
          <input type="text" placeholder="Search here" className="search-bar-displayevaluatorform" />
          <div className="profile-section-displayevaluatorform">
            <div>
              <FaBell className="notification-icon-displayevaluatorform" />
            </div>
            <div className="user-info-displayevaluatorform">
              <img src="/navbar/profilepicture.png" alt="User Avatar" className="user-initials-displayevaluatorform" />
              <div className="user-details-displayevaluatorform">
                <span className="user-name-displayevaluatorform">
                  Program Mang <RiArrowDropDownLine className="drop-displayevaluatorform" />
                </span>
                <br />
                <span className="user-email-displayevaluatorform">manager@mail.com</span>
              </div>
            </div>
          </div>
        </header>
        <section className="content-displayevaluatorform">
          <div className="content-header-displayevaluatorform">
            <h2>Form Details</h2>
          </div>
          <div className="form-list-displayevaluatorform">
            <table className="form-table-displayevaluatorform">
              <thead>
                <tr>
                  {fieldNames.map((fieldName, index) => (
                    <th key={index}>{fieldName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formDetails.responses.map((response, index) => (
                  <tr key={index}>
                    {fieldNames.map((fieldName, subIndex) => (
                      <td key={subIndex}>{response[fieldName]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DisplayEvaluatorForm;

 
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./FounderDetails.css";
import { FaUserCircle, FaRocket, FaTicketAlt, FaBell } from "react-icons/fa";
import { IoMdLock, IoIosDocument } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import logo from "./logo.png";

const FounderDetails = () => {
  const { founderId } = useParams();
  const [founder, setFounder] = useState(null);

  // Sample data for founders
  const foundersData = [
    {
      id: 1,
      name: "Wade Warren",
      contactNumber: "+91 9800000121",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Graphic designer",
      resumeLink: "resume12.pdf",
      qualification: "Mtech",
    },
    {
      id: 2,
      name: "Lari",
      contactNumber: "+91 9800456121",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Designer",
      resumeLink: "resume12.pdf",
      qualification: "Btech",
    },
    {
      id: 3,
      name: "Hala",
      contactNumber: "+91 9800258963",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Engineer",
      resumeLink: "resume12.pdf",
      qualification: "Bcom",
    },
    {
      id: 4,
      name: "Careem",
      contactNumber: "+91 9800789645",
      officialEmail: "wwe@gmail.com",
      dob: "12-02-1988",
      designation: "Developer",
      resumeLink: "resume12.pdf",
      qualification: "Bsc",
    },
  ];

  useEffect(() => {
    const foundFounder = foundersData.find(f => f.id === parseInt(founderId));
    setFounder(foundFounder);
  }, [founderId]);

  if (!founder) {
    return <div>No founder data available</div>;
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <img src={logo} alt="Logo" style={{ width: "100px", position:"relative" }} />
          </div>
          <div className="nav-container">
            <nav className="nav">
              <ul>
                <li className="active" style={{ marginTop: "120px" }}>
                  <FaUserCircle className="nav-icon" /> Founders Profile
                </li>
                <li>
                  <FaRocket className="nav-icon" /> Startup General
                </li>
                <li>
                  <IoMdLock className="nav-icon" /> Startup Legal
                </li>
                <li>
                  <IoIosDocument className="nav-icon" /> MIS Docs
                </li>
                <li>
                  <FaTicketAlt className="nav-icon" /> Tickets
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <span className="founder">
            <FiMenu style={{ color: "#909090" }} /> Founders
          </span>
          <input type="text" placeholder="Search here" className="search-bar" />
          <div className="profile-section">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="user-info">
              <span className="user-initials">Amit</span>
              <div className="user-details">
                <span className="user-name">
                  Mr. Amit Rathod <RiArrowDropDownLine className="drop" />
                </span>
                <br />
                <span className="user-email">Amit@mail.com</span>
              </div>
            </div>
          </div>
        </header>
        <section className="founder-details">
          <h2>Founder Information</h2>
          <h3 className="label">Name : {founder.name} </h3>
               
          <table className="founder-info-table">
            <tbody>
              <tr>
                <td className="label">Contact Number</td>
                <td>{founder.contactNumber}</td>
                <td className="label">Official Email</td>
                <td>{founder.officialEmail}</td>
                <td className="label">Date of Birth</td>
                <td>{founder.dob}</td>
              </tr>
              <tr>
                <td className="label">Designation</td>
                <td>{founder.designation}</td>
                <td className="label">Resume (in PDF)</td>
                <td>
                  <a href={founder.resumeLink} target="_blank" rel="noopener noreferrer">
                    {founder.resumeLink}
                  </a>
                </td>
                <td className="label">Qualification</td>
                <td>{founder.qualification}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default FounderDetails;

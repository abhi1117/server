import React from 'react';
import './Founderprofile.css';

const FounderProfile = () => {
  return (
    <div className="container">
      <aside className="sidebar">
        <ul>
          <li className="active">Founders Profile</li>
          <li>Startup General</li>
          <li>Startup Legal</li>
          <li>MIS Docs</li>
          <li>Tickets</li>
        </ul>
      </aside>
      <main className="content">
        <header className="header">
          <h1>Founder Information</h1>
        </header>
        <section className="founder-details">
          <div className="profile">
            <div className="avatar">WW</div>
            <div className="info">
              <h2>Wade Warren</h2>
            </div>
          </div>
          <table className="details-table">
            <tbody>
              <tr>
                <td>Contact Number</td>
                <td>9800000000</td>
              </tr>
              <tr>
                <td>Official Email</td>
                <td>ww@gmail.com</td>
              </tr>
              <tr>
                <td>Date Of Birth</td>
                <td>12-02-1977</td>
              </tr>
              <tr>
                <td>Designation</td>
                <td>Graphic designer</td>
              </tr>
              <tr>
                <td>Resume (in PDF)</td>
                <td><a href="#">resume12.pdf</a></td>
              </tr>
              <tr>
                <td>Qualification</td>
                <td>BSC-IT</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default FounderProfile;

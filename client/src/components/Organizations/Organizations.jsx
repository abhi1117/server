import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Define API URL or move to a config file
const API_URL = "https://incubator.drishticps.org/api/organizations";

// Configure headers if you have a token stored, for example in localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Adjust this according to where you store your token
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await axios.get(API_URL, { headers: getAuthHeaders() });
      setOrganizations(response.data);
    };
    fetchOrganizations();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    const updatedOrgs = organizations.filter((org) => org._id !== id);
    setOrganizations(updatedOrgs);
  };

  return (
    <div>
      <h1>Organizations</h1>
      <Link to="/create-organization">Create New Organization</Link>
      <ul>
        {organizations.map((org) => (
          <li key={org._id}>
            {org.name} - {org.adminName}
            <Link to={`/organization-details/${org._id}`}>View</Link>
            <Link to={`/edit-organization/${org._id}`}>Edit</Link>
            <button onClick={() => handleDelete(org._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CreateOrganization = () => {
  const [form, setForm] = useState({
    organizationName: "",
    adminName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /*
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, { headers: getAuthHeaders() });
      navigate('/organizations');
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };
  */
  //UPDATED CODE TO CREATE ORGANIZATION.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form, { withCredentials: true });
      navigate("/organizations");
    } catch (error) {
      console.error("Failed to create organization:", error);
    }
  };
  return (
    <div>
      <h1>Create Organization</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="organizationName"
          value={form.organizationName}
          onChange={handleChange}
          placeholder="Organization Name"
        />
        <input
          type="text"
          name="adminName"
          value={form.adminName}
          onChange={handleChange}
          placeholder="Admin Name"
        />
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
        />
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

const EditOrganization = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    organizationName: "",
    adminName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganization = async () => {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      setForm({
        organizationName: response.data.name,
        adminName: response.data.adminName,
        phoneNumber: response.data.adminPhone,
        username: response.data.username,
        email: response.data.email,
      });
    };
    fetchOrganization();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${id}`, form, { headers: getAuthHeaders() });
      navigate("/organizations");
    } catch (error) {
      console.error("Failed to update organization:", error);
    }
  };

  return (
    <div>
      <h1>Edit Organization</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="organizationName"
          value={form.organizationName}
          onChange={handleChange}
          placeholder="Organization Name"
        />
        <input
          type="text"
          name="adminName"
          value={form.adminName}
          onChange={handleChange}
          placeholder="Admin Name"
        />
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
        />
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

const OrganizationDetails = () => {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);

  /*
  useEffect(() => {
    const fetchOrganization = async () => {
      const response = await axios.get(`${API_URL}/${id}`,
         { headers: getAuthHeaders()});
      setOrganization(response.data);
    };
    fetchOrganization();
  }, [id]);
  */
  //UPDATED CODE TO GET ORGANIZATIONS.
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(`${API_URL}/${id}`, {
          withCredentials: true, // Ensures the JWT token in the cookie is sent
        });
        setOrganization(response.data);
      } catch (error) {
        console.error("Error fetching organization:", error);
      }
    };

    fetchOrganization();
  }, [id]);

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{organization.name}</h1>
      <p>Admin Name: {organization.adminName}</p>
      <p>Phone Number: {organization.adminPhone}</p>
      <p>Username: {organization.username}</p>
      <p>Email: {organization.email}</p>
    </div>
  );
};

export {
  OrganizationList,
  CreateOrganization,
  EditOrganization,
  OrganizationDetails,
};

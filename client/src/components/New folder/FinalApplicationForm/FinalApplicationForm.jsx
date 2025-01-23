import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PublicFormPreview from "../Form/PublicFormPreview.jsx";
import "./FinalApplicationForm.css";

const FinalApplicationForm = () => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiredMessage, setExpiredMessage] = useState(null); // New state to handle expiration message

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Check if the link is expired by calling the link status endpoint
        const checkLinkResponse = await axios.get(
          `https://incubator.drishticps.org/api/pipelines/check-link/${id}`
        );
        if (checkLinkResponse.data.status === "Expired") {
          setExpiredMessage("Access denied. Link has expired.");
        } else {
          // Fetch the application data if the link is not expired
          const pipelineResponse = await axios.get(
            `https://incubator.drishticps.org/api/pipelines/${id}`
          );
          const pipeline = pipelineResponse.data;

          // console.log("Pipeline Data:", pipeline);

          const formId = pipeline.forms; // Assuming `forms` is directly a string
          const pipelineId = pipeline._id; // Added to get pipelineId
          // Adjusting how we extract the poster URL
          let posterUrl = "";
          if (pipeline.poster) {
            if (Array.isArray(pipeline.poster) && pipeline.poster.length > 0) {
              // Check if the URL is already an absolute URL
              if (pipeline.poster[0].url.startsWith("http")) {
                posterUrl = pipeline.poster[0].url;
              } else {
                posterUrl = `https://incubator.drishticps.org/${pipeline.poster[0].url}`;
              }
            } else if (pipeline.poster.url) {
              // Check if the URL is already an absolute URL
              if (pipeline.poster.url.startsWith("http")) {
                posterUrl = pipeline.poster.url;
              } else {
                posterUrl = `https://incubator.drishticps.org/${pipeline.poster.url}`;
              }
            }
          }
          // Log the poster URL for debugging
          // console.log("Poster URL:", posterUrl);
          setApplicationData({
            title: pipeline.applicationTitle,
            poster: posterUrl, // Set the poster URL
            description: pipeline.description,
            documents: pipeline.supportingDocuments,
            formId: formId, // Ensure the correct formId is set
            pipelineId: pipelineId, // Ensure the correct pipelineId is set
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application data:", error);
        setError(error);
        setLoading(false);
      }
    };
    fetchApplicationData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  /** START CHANGE FOR showing message to user if the link is expired --- **/
  if (expiredMessage) {
    return (
      <div className="full-page-message-finalapplicationForm">
        <div className="expired-message-container-finalapplicationForm">
          <h1 className="expired-message-title-finalapplicationForm">
            Thank you for your interest.
          </h1>
          <p className="expired-message-text-finalapplicationForm">
            This application form is now closed for responses. Please check
            'IITI DRISHTI CPS Foundation' social media handles for more program
            details.
          </p>
        </div>
      </div>
    );
  }

  /** END CHANGE FOR showing message to user if the link is expired --- **/

  // Log formId to verify it's correctly set
  // console.log(
  //   "Form ID being passed to PublicFormPreview:",
  //   applicationData.formId
  // );
  // console.log(
  //   "Pipeline ID being passed to PublicFormPreview:",
  //   applicationData.pipelineId
  // );
  /*** START CHANGE FOR text styling --- ***/
  // Function to safely render HTML in JSX for the description
  const createMarkup = (html) => {
    return { __html: html };
  };
  /*** END CHANGE FOR text styling --- ***/

  return (
    <div className="application-form-containerfinalapplication">
      <h1 className="application-titlefinalapplication">
        {applicationData.title}
      </h1>
      {applicationData.poster && (
        <img
          src={applicationData.poster}
          alt="Application Poster"
          className="application-posterfinalapplication"
        />
      )}
      {/* START CHANGE: Render description with text styling */}
      <div
        className="application-descriptionfinalapplication"
        dangerouslySetInnerHTML={createMarkup(applicationData.description)} // Render description with HTML tags
      />
      {/* END CHANGE FOR text styling */}

      {/* START CHANGE Supporting Documents --- */}
      {applicationData.documents && applicationData.documents.length > 0 && (
        <div className="supporting-documentsfinalapplication">
          <h2>Supporting Documents</h2>
          <ul>
            {applicationData.documents.map((doc, index) => {
              // Check if the document URL is already an absolute URL
              const documentUrl = doc.url.startsWith("https")
                ? doc.url
                : `https://incubator.drishticps.org/${doc.url}`;
              // : `${doc.url}`;
              return (
                <li key={index}>
                  <span className="document-number-documentsfinalapplication">
                    {index + 1}.
                  </span>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* END CHANGE FOR Supporting Documents--- */}

      <div>
        {/* Only render PublicFormPreview if formId is available */}
        {applicationData.formId ? (
          <PublicFormPreview
            formId={applicationData.formId}
            pipelineId={applicationData.pipelineId}
          />
        ) : (
          <p>Loading form...</p>
        )}
      </div>
    </div>
  );
};

export default FinalApplicationForm;

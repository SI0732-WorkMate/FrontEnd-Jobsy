import axios from "axios";

export const getJobOffersData = () => {
  return axios.get("http://localhost:3500/job_applications_summary");
};

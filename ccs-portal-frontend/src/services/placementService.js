import axios from 'axios';

const API_URL = 'http://localhost:5000/api/placements';

const placementService = {
  // Get all active placements (Student view)
  getActivePlacements: async () => {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data;
  },

  // Get all placements (Admin/Placement view)
  getAllPlacements: async () => {
    const res = await axios.get(`${API_URL}/all`, { withCredentials: true });
    return res.data;
  },

  // Create a new drive
  createDrive: async (driveData) => {
    const res = await axios.post(API_URL, driveData, { withCredentials: true });
    return res.data;
  },

  // Update a drive
  updateDrive: async (id, driveData) => {
    const res = await axios.put(`${API_URL}/${id}`, driveData, { withCredentials: true });
    return res.data;
  },

  // Delete a drive
  deleteDrive: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    return res.data;
  }
};

export default placementService;

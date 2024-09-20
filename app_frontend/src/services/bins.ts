import axios from 'axios';
const baseUrl = 'https://www.drumsofliberation.ca/api'

const getRequestHistory = async (bin_id: string) => { // for a specific user
  const response = await axios.get(`${baseUrl}/history/${bin_id}`)
  return response.data
}

const getMongoData = async (mongoId: string) => {
  const response = await axios.get(`${baseUrl}/mongodata/${mongoId}`);
  return response.data
}

const createNewEndpoint = async () => {
  const request = axios.post(`${baseUrl}/bins`);
  const response = await request;
  return response.data;
};

export default { getRequestHistory, createNewEndpoint, getMongoData }
import { query } from '../db/database.js';
import Router from 'express-promise-router'
import endPointGen from '../db/endpointGen.js'
import { saveRequestToMongo, getMongoRecord } from '../db/mongodb.js';

export const router = new Router();

router.post('/bins', async (req, res) => {
  const newEndpoint = endPointGen();

  try {
    const statement = 'INSERT INTO endpoints (endpoint) VALUES ($1)';
    await query(statement, [newEndpoint]);
    res.send(newEndpoint)
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
});

router.get('/mongodata/:mongoId', async (req, res) => {
  const { mongoId } = req.params
  const mongoRecord = await getMongoRecord(mongoId);
  res.send(mongoRecord);
})

router.get('/history/:binId', async (req, res) => {
  const statement = `
  SELECT 
    requests.request_method, 
    requests.request_url, 
    requests.time_created, 
    requests.mongo_doc_id, 
    endpoints.endpoint 
  FROM 
    requests 
  INNER JOIN 
    endpoints 
    ON endpoints.id = requests.endpoint_id 
  WHERE 
    endpoint = $1
  ORDER BY
    requests.time_created DESC
`;
  const requests = await query(statement, [req.params.binId]);
  res.send(requests.rows);
});

router.all('/endpoint/:binId', async (req, res) => {
  const io = req.app.get('io');
  const referer = req.headers.referer ? req.headers.referer : '/';
  
  const requestData = {
    method: req.method,
    url: referer,
    headers: req.headers,
    body: req.body,
    query: req.query,
    endpoint_id: req.params.binId,
    ip: req.ip,
    timestamp: new Date().toUTCString(),
  }
 
  try {
    const response = await saveRequestToMongo(requestData)
    const mongoId = response._id.toString()
    requestData.mongo_doc_id = mongoId;
  
    // Get Endpoint ID for Bin of Request
    const result = await query('SELECT id FROM endpoints WHERE endpoint = $1', [req.params.binId]);
    const endpoint_id = result.rows[0].id;

    // Add Request to Request Table in PGSQL Database
    const statement = 'INSERT INTO requests (request_method, request_url, time_created, endpoint_id, mongo_doc_id)' +
    'VALUES ($1, $2, $3, $4, $5)';
    await query(statement, [req.method, requestData.url, requestData.timestamp, endpoint_id, mongoId]); 

    io.emit('newRequest', {
      request_method: req.method,
      request_url: requestData.url,
      time_created: requestData.timestamp,
      endpoint: endpoint_id,
      mongo_doc_id: mongoId,
      endpoint_val: requestData.endpoint_id
    });
    
    res.send(req.status)
  } catch(error) {
    console.log('error', error)
    res.status(500);
  }
});
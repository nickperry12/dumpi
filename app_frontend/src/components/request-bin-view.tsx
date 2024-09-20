import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import binService from '../services/bins';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

interface Request {
  request_method: string, 
  request_url: string, 
  time_created: string, 
  mongo_doc_id: string, 
  endpoint: string
}

export function RequestBinView() {
  const { bin } = useParams();
  const [binId, setBinId] = useState<string | undefined>(bin);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState([])
 
  const requestClickHandler = async (request: any) => {
    const mongoData = await binService.getMongoData(request.mongo_doc_id);
    const requestObj = mongoData.payload;
    requestObj.mongo_doc_id = request.mongo_doc_id;
    setSelectedRequest(requestObj);
  }
  
  async function getHistory() {
    try {
      if (binId) {
        const history = await binService.getRequestHistory(binId);
        setRequests(history)
      }
    } catch (error) {
      console.error('Error fetching request history');
    }
  }

  useEffect(() => {
    getHistory()

    const socket = io('https://drumsofliberation.ca:3000');
    socket.on('newRequest', (req) => {
      if (req.endpoint_val === binId) {
        setRequests((prevRequests) => [req, ...prevRequests]);
      }
    });

    return () => {
      socket.off('newRequest');
      socket.disconnect();
    };
  }, [])

  const getMethodColor = (method: string): string => {
    const colors = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      DELETE: "bg-red-500"
    }
    return colors[method] || "bg-gray-500"
  }
  
  const copyBinId = () => {
    navigator.clipboard.writeText(`https://www.drumsofliberation.ca/api/endpoint/${binId}`)
  }

  return (
    <>
      <div className="inputbtn">
        {`Your endpoint is:  https://www.drumsofliberation.ca/api/endpoint/${binId}`} <button className="copybtn" onClick={copyBinId}>Copy</button>
      </div>
      <div className="flex h-screen">
        <div className="w-1/3 border-r">
          <ScrollArea className="h-screen">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Requests</h2>
              {requests.map((request) => (
                <div
                  key={request.mongo_doc_id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedRequest.mongo_doc_id === request.mongo_doc_id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => requestClickHandler(request)}
                >
                  <div className="flex justify-between items-center">
                    <Badge className={getMethodColor(request.request_method)}>{request.request_method}</Badge>
                    <span className="text-sm text-gray-500">{request.time_created}</span>
                  </div>
                  <div className="mt-1 text-sm truncate">{request.request_url}</div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="w-2/3 p-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedRequest.method} {selectedRequest.url}</CardTitle>
              <CardDescription>{selectedRequest.timestamp}</CardDescription>
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {selectedRequest.length != 0 ? (
                <div className="space-y-4">
                  <div>
                    <pre className="bg-gray-100 p-2 rounded">
                      <details>
                        <summary>Headers</summary>
                        <div>
                          {selectedRequest.headers ? (
                            <ul>
                              {Object.entries(selectedRequest.headers).map(([key, value]) => (
                                <li key={key}>
                                  {key}: {value}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No headers available.</p>
                          )}
                        </div>
                      </details>
                    </pre>
                  </div>
                  {selectedRequest.mongo_doc_id && (
                    <div>
                      <pre className="bg-gray-100 p-2 rounded">
                        <details>
                          <summary>Query Parameters</summary>
                          <div>
                            {selectedRequest.query ? (
                              <ul>
                                {Object.entries(selectedRequest.query).map(([key, value]) => (
                                  <li key={key}>
                                    {key}: {value}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No queries available.</p>
                            )}
                          </div>
                        </details>
                      </pre>
                    </div>
                  )}
                  {selectedRequest.mongo_doc_id && (
                    <div>
                      <pre className="bg-gray-100 p-2 rounded">
                        <details>
                          <summary>Body</summary>
                          <div>
                            {selectedRequest.body ? (
                              <ul>
                                {JSON.stringify(selectedRequest.body)}
                              </ul>
                            ) : (
                              <p>No body available.</p>
                            )}
                          </div>
                        </details>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p>No request selected. Please select a request to view details.</p>
                </div>
              )}
            </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
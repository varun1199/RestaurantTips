// API root endpoint that documents available API routes
export default function handler(req, res) {
  // Create a simple API documentation response
  const apiDocs = {
    api: "Yeti Tips & Till API",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
    endpoints: [
      {
        path: "/api",
        method: "GET",
        description: "This API documentation endpoint"
      },
      {
        path: "/api/hello",
        method: "GET",
        description: "Simple hello world endpoint"
      },
      {
        path: "/status",
        method: "GET",
        description: "System status and environment information"
      },
      {
        path: "/",
        method: "GET",
        description: "Application landing page"
      }
    ]
  };

  // Return the API documentation as JSON
  res.status(200).json(apiDocs);
}
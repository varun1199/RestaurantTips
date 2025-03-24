// API root endpoint that documents available API routes
export default function handler(req, res) {
  // Get maintenance mode status
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Create a simple API documentation response
  const apiDocs = {
    api: "Yeti Tips & Till API",
    version: "1.0.0",
    status: maintenanceMode ? "maintenance" : "online",
    timestamp: new Date().toISOString(),
    deploymentMode: maintenanceMode ? "static" : "transitional",
    endpoints: [
      {
        path: "/api",
        method: "GET",
        description: "This API documentation endpoint",
        status: "available"
      },
      {
        path: "/api/hello",
        method: "GET",
        description: "Simple hello world endpoint",
        status: "available"
      },
      {
        path: "/api/db-config",
        method: "GET",
        description: "Database configuration status",
        status: "available"
      },
      {
        path: "/status",
        method: "GET",
        description: "System status and environment information",
        status: "available"
      },
      {
        path: "/",
        method: "GET",
        description: "Application landing page",
        status: "available"
      },
      {
        path: "/api/auth/*",
        method: "Various",
        description: "Authentication endpoints",
        status: maintenanceMode ? "disabled" : "transitional" 
      },
      {
        path: "/api/employees/*",
        method: "Various",
        description: "Employee management endpoints",
        status: maintenanceMode ? "disabled" : "transitional"
      },
      {
        path: "/api/tips/*",
        method: "Various",
        description: "Tip management endpoints",
        status: maintenanceMode ? "disabled" : "transitional"
      },
      {
        path: "/api/till/*",
        method: "Various",
        description: "Till calculation endpoints",
        status: maintenanceMode ? "disabled" : "transitional"
      }
    ]
  };

  // Add deployment info for diagnostic purposes
  apiDocs.deployment = {
    environment: process.env.NODE_ENV || "development",
    region: process.env.VERCEL_REGION || "unknown",
    maintenanceMode: maintenanceMode,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString()
  };

  // Return the API documentation as JSON
  res.status(200).json(apiDocs);
}
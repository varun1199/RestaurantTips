// Simple hello endpoint that works in ES module format
export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from Yeti Tips & Till!",
    timestamp: new Date().toISOString(),
    status: "online"
  });
}
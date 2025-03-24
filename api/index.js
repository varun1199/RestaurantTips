// Ultra minimal serverless function (for debugging Vercel deployment)
module.exports = (req, res) => {
  res.status(200).json({ message: "Hello World" });
};
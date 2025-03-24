// Ultra minimal adapter function
module.exports = (req, res) => {
  res.status(200).json({ message: "Adapter working" });
};
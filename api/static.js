// Extremely simplified static function
module.exports = (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Yeti Tips & Till</title>
</head>
<body>
  <h1>Yeti Tips & Till</h1>
  <p>Basic deployment test</p>
  <a href="/api">Check API</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
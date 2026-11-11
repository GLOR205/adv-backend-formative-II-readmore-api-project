const handleError = (res, error) => {
  if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
  if (error.name === 'CastError') return res.status(400).json({ error: `Invalid value for ${error.path}` });
  console.error(error);
  return res.status(500).json({ error: 'Server error' });
};

module.exports = handleError;
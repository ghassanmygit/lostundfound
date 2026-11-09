const katalogService = require("../services/katalogService");

const getKatalog = async (req, res) => {
  const { data, meta } = await katalogService.getKatalog(req.query);
  res.json({ success: true, data, meta });
};

const getDetailKatalog = async (req, res) => {
  const barang = await katalogService.getDetailKatalog(req.params.id);
  res.json({ success: true, data: barang });
};

module.exports = { getKatalog, getDetailKatalog };

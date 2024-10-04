const createAsideDataModel = require('../Model/asideDataMd'); // Assuming your model is in models/AsideData.js

// GET aside data by type (menu, member, etc.)
exports.asideData =  async (req, res) => {
const AsideData = createAsideDataModel(req.collegeDB);
  try {
    const { type } = req.params;
    const asideData = await AsideData.findById({_id:type});
    if (!asideData) {
      return res.status(404).json({ message: `${type} not found` });
    }
    res.json(asideData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

const createAsideDataModel = require('../../Model/asideData/asideDataMd');
const { handleCRUD } = require('../../Utilities/crudUtils');

exports.asideData = async (req, res) => {
  const AsideData = createAsideDataModel(req.collegeDB);
  try {
    const { type } = req.params;
    const asideData = await handleCRUD(AsideData, 'findOne', { _id: type });
    if (!asideData) {
      return res.status(404).json({ message: `${type} not found` });
    }
    res.json(asideData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
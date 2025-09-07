const createAsideDataModel = require('../../Model/asideData/asideDataMd');
const { getApiConfig } = require('../../Utilities/apiConfig');

exports.asideData = async (req, res) => {
  const apiConfig = getApiConfig('asideData');
  
  try {
    const { type } = req.params;
    const AsideData = createAsideDataModel(req.collegeDB);
    
    const asideData = await AsideData.findOne({ _id: type });
    if (!asideData) {
      return res.status(404).json({ 
        success: false,
        message: `${type} not found`,
        requestId: res.locals.requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Aside data retrieved successfully',
      data: asideData,
      type: type,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      version: apiConfig.version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message,
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  asideData: exports.asideData
};
exports.createMembersData = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  try {
    const newMember = await handleCRUD(MembersData, 'create', {}, req.body);
    res.status(200).json({ message: 'Member added successfully!', data: newMember });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member', details: error.message });
  }
};

exports.updateMembersData = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { _id, updatedData } = req.body;
  try {
    const result = await handleCRUD(MembersData, 'update', { _id }, { $set: updatedData });
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Member updated successfully' });
    } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
      res.status(200).json({ message: 'No updates were made' });
    } else {
      res.status(404).json({ message: 'No matching member found or values are unchanged' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member', details: error.message });
  }
};

exports.deleteMembersData = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { ids } = req.body;
  try {
    const result = await handleCRUD(MembersData, 'delete', { _id: { $in: ids.map(id => id) } });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Members deleted successfully' });
    } else {
      res.status(404).json({ message: 'No matching members found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete members', details: error.message });
  }
};

exports.getMemberById = async (req, res) => {
  const MembersData = createMembersDataModel(req.collegeDB);
  const { id } = req.params;
  try {
    const member = await MembersData.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member', details: error.message });
  }
};
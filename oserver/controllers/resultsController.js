const EngineeringResult = require('../models/EngineeringResult');

exports.getResultByStudentId = async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }
        const result = await EngineeringResult.findOne({ studentId });
        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
};

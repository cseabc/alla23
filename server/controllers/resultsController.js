const EngineeringResult = require('../models/EngineeringResult');

exports.getResultByStudentId = async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required', serverInfo: process.env.PORT });
        }
        const result = await EngineeringResult.findOne({ studentId });
        if (!result) {
            return res.status(404).json({ message: 'Result not found', serverInfo: process.env.PORT });
        }
        // Attach server information (e.g., the PORT number) to the response for demonstration
        const resultObj = result.toObject();
        resultObj.serverInfo = process.env.PORT;
        res.json(resultObj);
    } catch (error) {
        next(error);
    }
};

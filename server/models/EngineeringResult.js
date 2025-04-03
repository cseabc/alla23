const mongoose = require('mongoose');

const EngineeringResultSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: Number, required: true },
    grades: { type: Object, required: true },
    cgpa: { type: Number, required: true }
});

module.exports = mongoose.model('EngineeringResult', EngineeringResultSchema);

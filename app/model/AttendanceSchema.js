const mongoose = require("mongoose");
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  userDetails: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  entries: [
    {
      startTime: { type: Date, required: true },
      endTime: { type: Date },
      location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      }
    }
  ]
});

// Unique constraint for each user's attendance per day
attendanceSchema.index({ userDetails: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  sos: { type: mongoose.Schema.Types.ObjectId, ref: "SOS", required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "seen"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);

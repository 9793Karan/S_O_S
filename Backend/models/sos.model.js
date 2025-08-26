import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    responder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    status: { type: String, enum: ["pending", "handled"], default: "pending" },

    // Agentic priority fields
    priorityScore: { type: Number, default: 0 },           // 0..1
    priorityTag: { type: String, default: "Minimal" },     // Critical/High/Medium/Low/Minimal
    priorityColor: { type: String, default: "#0A84FF" },   // hex color
    priorityFactors: {
      S: { type: Number, default: 0 },
      T: { type: Number, default: 0 },
      V: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      E: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

sosSchema.index({ location: "2dsphere" });

export default mongoose.model("SOS", sosSchema);

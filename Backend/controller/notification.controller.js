import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ responder: req.user._id })
      .populate("sos")
      .populate("sos.user", "name email");
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markNotificationSeen = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Not found" });

    notification.status = "seen";
    await notification.save();
    res.json({ message: "Notification marked seen", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

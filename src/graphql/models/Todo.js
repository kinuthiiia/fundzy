import mongoose from "mongoose";
import timestamps from "mongoose-timestamp";

const { Schema } = mongoose;

export const TodoSchema = new Schema(
  {
    name: String,
    complete: Boolean,
  },
  {
    collection: "todos",
  }
);

TodoSchema.plugin(timestamps);

TodoSchema.index({ createdAt: 1, updatedAt: 1 });

module.exports = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

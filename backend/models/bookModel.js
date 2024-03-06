import mongoose from 'mongoose';

const bookSchema = mongoose.Schema(
  {
    // _id is an unique identifier automatically added by mongoose for each document.

    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publicationYear: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model('Book', bookSchema);
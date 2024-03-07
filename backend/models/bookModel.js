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
      // Custom validator for author
      validate: {
        validator: function(v) {
          // Check if the author contains only small and uppercase alphabets and spaces
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: props => `${props.value} is not a valid author name! Author must contain only alphabets and spaces.`,
      },
    },
    publicationYear: {
      type: Number,
      required: true,
      // publishYear validation
      validate: {
        validator: function(v) {
            return v && !isNaN(v) && v <= new Date().getFullYear();
        },
        message: props => `${props.value} is not a valid publication year! Year must be in the past.`
      }
    },
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model('Book', bookSchema);
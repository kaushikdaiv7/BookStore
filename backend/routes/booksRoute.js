import express from 'express';
import { Book } from "../models/bookModel.js";

const router = express.Router();



// API for creating a new Book in mongodb database
router.post('/', async (request, response) => {
    try {
      if (!request.body.title || !request.body.author || !request.body.publicationYear) {
        return response.status(400).send({
            message: 'Send all required fields: title, author, publishYear',
        });
      }

      const currentYear = new Date().getFullYear();
      
      // publishYear validation
      if (request.body.publicationYear > currentYear) {
        return response.status(400).send({
          message: 'Invalid publication year, publication year must be in the past',
        });
      }

      const newBook = {
        title: request.body.title,
        author: request.body.author,
        publicationYear: request.body.publicationYear,
      };
  
      const book = await Book.create(newBook);
      return response.status(201).send(book);
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  });

// API to get all the books from the mongodb database
router.get('/', async (request, response) => {
    try {
        const books = await Book.find({});
        return response.status(200).json({
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// API to get a book from the mongodb database by id
router.get('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const book = await Book.findById(id);
        return response.status(200).json(book);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});
  
// API to update a book
router.put('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const { publicationYear } = request.body;

        if (publicationYear && (isNaN(publicationYear) || publicationYear > new Date().getFullYear())) {
            return response.status(400).json({ message: 'publicationYear must be a valid year in the past.' });
        }

        const updateData = request.body;
  
        // option option { new: true } to return the updated document
        // option { runValidators: true } to ensure that any model validations are applied even for partial updates.
        const result = await Book.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  
        if (!result) {
            return response.status(404).json({ message: 'Book not found' });
        }
  
        return response.status(200).json({ message: 'Book updated successfully', data: result });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// API for deleting a book from mongodb database
router.delete('/:id', async (request, response) => {
    try {
        const { id } = request.params;
  
        const result = await Book.findByIdAndDelete(id);
  
        if (!result) {
            return response.status(404).json({ message: 'Book not found' });
        }
  
        return response.status(200).send({ message: 'Book deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;
  
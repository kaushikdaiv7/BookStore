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

// API to get books by searching over author or title
router.get('/search', async (request, response) => {
    try {
        const query = request.query.q;
  
        if (!query) {
            return response.status(400).json({ message: 'Please provide a search query.' });
        }
  
        // Use a case-insensitive regular expression for searching by title or author
        const searchRegex = new RegExp(query, 'i');
    
        // Search for books by title or author based on the query
        const searchResults = await Book.find({
            $or: [
            { title: searchRegex },
            { author: searchRegex },
            ],
        });
    
        return response.status(200).json({
            count: searchResults.length,
            data: searchResults,
        });
        } catch (error) {
        console.error(error.message);
        response.status(500).json({ message: 'Internal Server Error' });
    }
});

// API to get books stats
router.get('/stats', async (request, response) => {
    try {
        // Aggregate pipeline for different metrics - totalBooks, booksByAuthor, booksByYear, topAuthors
        const statsPipeline = [
            {   
                // facet helps in parallel execution of aggregations and queries, so this speeds up response and less queries sent to database.
                $facet: {
                    totalBooks: [{ $count: 'count' }],
                    earliestAndLatestYear: [
                        { $group: { _id: null, minYear: { $min: '$publicationYear' }, maxYear: { $max: '$publicationYear' } } },
                        { $project: { _id: 0, earliestPublicationYear: '$minYear', latestPublicationYear: '$maxYear' } },
                    ],
                    booksByAuthor: [
                        { $group: { _id: '$author', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                    ],
                    booksByYear: [
                        { $group: { _id: '$publicationYear', count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                    ],
                    topAuthors: [
                        { $group: { _id: '$author', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }, // This is N - top authors. Adjust this parameter as required.
                    ],
                },
            },
        ];
    
        // Execute the aggregation pipeline
        const [stats] = await Book.aggregate(statsPipeline);
        return response.status(200).json(stats);

        } catch (error) {
            console.error(error.message);
            response.status(500).json({ message: 'Internal Server Error' });
        }
});

// API to get all the books from the mongodb database
router.get('/', async (request, response) => {
    // Set default values for pagination
    const page = parseInt(request.query.page) || 1;       // Default to page 1 if not specified
    const limit = parseInt(request.query.limit) || 10;   // Default to 10 items per page if not specified

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        // Fetch total number of books to calculate total pages
        const totalBooks = await Book.countDocuments({});

        // Fetch subset of books based on pagination parameters
        const books = await Book.find({}).skip(startIndex).limit(limit);

        // Construct pagination result
        const result = {};

        if (endIndex < totalBooks) {
            result.next = {
                page: page + 1,
                limit: limit
            };
        }

        if (startIndex > 0) {
            result.previous = {
                page: page - 1,
                limit: limit
            };
        }

        result.totalBooks = totalBooks;
        result.totalPages = Math.ceil(totalBooks / limit);
        result.count = books.length;
        result.data = books;

        return response.status(200).json(result);
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

        if (!book) {
            return response.status(404).json({ message: 'Book not found' });
        }

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
  
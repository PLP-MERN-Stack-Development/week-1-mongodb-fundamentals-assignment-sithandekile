const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

async function findingBooks() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    //  Find books by a specific author 
    const melvilleBooks = await collection.find({ author: "Herman Melville" }).toArray();
    console.log('\nThese are the books written by Herman Melville:');
    melvilleBooks.forEach(book => console.log(`- ${book.title} (${book.published_year})`));

    // Find books published after 1950
    const publishedAfter1950 = await collection.find({ published_year: { $gt: 1950 } }).toArray();
    console.log('\nThese are the books published after 1950:');
    publishedAfter1950.forEach(book => console.log(`- ${book.title} (${book.published_year})`));

    //  Find books in a specific genre
    const specificGenreBooks = await collection.find({ genre: "Fiction" }).toArray();
    console.log('\n These are the books in fiction genre:');
    specificGenreBooks .forEach(book => console.log(`- ${book.title} by ${book.author}`));

    //  Update the price of a specific book
    await collection.updateOne(
      { title: "Pride and Prejudice" },
      { $set: { price: 15.00 } }
    );
    console.log('\nUpdated price for "Pride and Prejudice".');

    //  Deleting a book by its title
    await collection.deleteOne({ title: "Moby Dick" });
    console.log('\n"Moby Dick" has been deleted from the collection.');

    // Question3.  Advanced Query: in stock & published after 2010, projection, sorting, pagination
    const inStockBooks = await collection.find(
      { in_stock: true, published_year: { $gt: 2010 } },
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).sort({ price: 1 }).skip(0).limit(5).toArray();

    console.log('\nIn-stock books published after 2010 (first 5, sorted by price):');
    inStockBooks.forEach(book => console.log(book));

    // Question4. Aggregation: Average price by genre
    const avgPriceByGenre = await collection.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log('\n This is the Average price by genre:', avgPriceByGenre);

    //  Aggregation: Author with most books
    const topAuthor = await collection.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('\nThis is our author with most books:', topAuthor);

    // question5_1. Create an index on the `title` field
await collection.createIndex({ title: 1 });
console.log('Created index on title field.');

// question5_2. Create a compound index on `author` and `published_year`
await collection.createIndex({ author: 1, published_year: 1 });
console.log('Created compound index on author and published_year.');

// question5_3. Use the explain() method to demonstrate performance improvement
const explainBefore = await collection.find({ title: "1984" }).explain("executionStats");
console.log('\nExplain output for title search:', explainBefore);

const explainCompound = await collection.find({ author: "George Orwell", published_year: 1949 }).explain("executionStats");
console.log('\nExplaining the output for compound index search:', explainCompound);

  } catch (error) {
    console.error('Error running queries:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

findingBooks();
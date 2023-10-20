# KnexMagic

KnexMagic is a utility library for working with the Knex.js query builder and provides methods for filtering and paginating data using cursor pagination. It is designed to simplify common data filtering and pagination tasks when working with a database using Knex.js.

## Installation

You can install KnexMagic via npm:

```bash
npm install knex-magic
```

## Usage

Here's how you can use KnexMagic in your Node.js application:

```ts
import { KnexMagic } from "knex-magic";

// Initialize a Knex.QueryBuilder instance
const knex = require("knex")(knexConfig);
const query = knex("your_table_name");

// Filtering Data
const filterParams = {
  // Define your filter parameters
};

const filteredQuery = KnexMagic.filter(query, filterParams);

// Cursor Pagination
const cursorParams = {
  cursor: "some_cursor_value", // Optional
  take: 10, // Optional, default is 10
  direction: "next", // Optional, 'next' or 'previous', default is 'next'
};

const options = {
  key: "id", // Optional, the cursor column, default is 'id'
  keyPrefix: "id", // Optional, the prefix for the cursor column, default is 'id'
};

// Define a callback to count the total number of records (optional)
const callbackCountQuery = async (query) => {
  return query.clone().count("id as count");
};

const result = await KnexMagic.paginate({
  query: filteredQuery,
  cursorParams,
  options,
  callbackCountQuery,
});

console.log(result);
```

## Examples

### Filtering Data

Filter data based on various criteria, such as search, in an expressive way:

```ts
const filterParams = {
  search: {
    columns: ["column1", "column2"],
    value: "search_value",
  },
  category: "category_name",
  price: {
    min: 10,
    max: 50,
  },
  colors: ["red", "blue"],
};

const filteredQuery = KnexMagic.filter(query, filterParams);
```

### Cursor Pagination

Paginate data using cursor pagination:

```ts
const cursorParams = {
  cursor: "cursor_value", // The cursor value to start from (optional)
  take: 10, // Number of items per page (optional)
  direction: "next", // Pagination direction, 'next' or 'previous' (optional)
};

const options = {
  key: "id", // Cursor column name (optional)
  keyPrefix: "id", // Cursor column prefix (optional)
};

const result = await KnexMagic.paginate({
  query: filteredQuery,
  cursorParams,
  options,
  callbackCountQuery, // Optional callback to count total records
});

console.log(result);
```

## Contributing

If you would like to contribute to KnexMagic or have any suggestions, please open an issue or submit a pull request on our [GitHub repository](https://github.com/mrrashidov/knex-nest).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

The authors of Knex.js for providing a powerful query builder.

**Note**: Make sure to replace 'your_table_name' and other placeholders with actual values in your code.

**Note**: This is a sample README, and you should customize it to suit your project's specific needs and requirements.

## Acknowledgments

We'd like to express our gratitude to the following individuals and projects that have contributed to and inspired this library:

- **Knex.js**: This library is built on top of the powerful [Knex.js](https://knexjs.org/) query builder, which simplifies database interactions and offers extensive support for various database systems. Knex.js has been instrumental in the development of KnexMagic.

- **Open Source Community**: We'd like to thank the entire open-source community for their valuable contributions, bug reports, and feature requests that have helped improve KnexMagic.

- **Anysoft**: We are grateful to the (Anysoft Organization)[https://anysoft.uz/] for their support in funding and promoting this project.

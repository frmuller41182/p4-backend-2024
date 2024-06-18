# Full Stack Web Development Project 4 - Finance App Backend

This project simulates the backend of a finance application, built using TypeScript, Prisma, Express JS, and a PostgreSQL database running on Docker. It encompasses various scenarios in the financial services industry, including acquisitions and market "manipulations". The application leverages Prisma as an ORM to efficiently interact with the PostgreSQL database.

## Features

- **Acquisitions:** Simulate company acquisitions where one company absorbs another, including employee transfers and stock price adjustments.
- **Market Manipulations:** Simulate market events such as bull markets and market crashes.
- **User Management:** Create, read, update, and delete user profiles.
- **Stock Management:** Add and retrieve stock information.
- **Portfolio Management:** Retrieve the total value of a user's portfolios.
- **Transaction Management:** Manage financial transactions associated with users and stocks.

## Getting Started

### 1. Install Dependencies

First, clone the repository and install the necessary dependencies:

```
$ bun install
```

### 2. Set up Database

Navigate to the directory containing the docker-compose.yml file and launch the Docker container:

```
$ cd docker
$ docker-compose up -d
$ cd ..
```

the `-d` flag runs the containers in the background, so you will be able to keep using the terminal.

### 3. Configure Environment Variables

Ensure your .env file is set up correctly in the root directory of the project. It should include the correct database connection string and PORT variable:

```
DATABASE_URL="postgresql://frank:frank1234@localhost:5432/financeDB"
PORT = "8888"
```

Replace frank:frank1234 with your username and password if different, and financeDB with your database name as necessary. Also, you can change the PORT where the server will be listening. Otherwise, if you leave the default values in the `docker-compose.yml` file you can use the URL above.

### 4. Set up Prisma

Run the following commands to set up Prisma. These commands generate the Prisma client and push the schema to your database, creating any necessary tables.

```
$ bunx prisma generate
$ bunx prisma db push
```

### 5. Seed the Database

To populate your database with initial data:

```
$ bunx prisma db seed
```

This step executes the seeding script defined in the prisma/seed.ts, which should populate your database with the initial required data. We even used some APIs to make the seeding data as realistic as possible!

### 6. Open Prisma Studio

In order to explore the data generated in the previous step, and to observe the changes produced by the scripts, it is strongly recommended to open Prisma Studio. You may do so by executing the following command:

```
$ bunx prisma studio
```

You can then open Prisma Studio in you web browser with the output URL.

### 7. Start the Application

```
$ bun dev
```

By running the command above you should be able to see a message that read `Finance App Backend listening on http://localhost:8888` (if you left the default PORT in the .env file). At this point, you can test the different APIs below!

1. `POST /financeapis/market/acquisition?buySide=&sellSide=`: Simulate a company acquisition. `buySide` and `sellSide` query parameters should be the symbol of the two companies conducting the M&A operation (e.g., AMZN and GOOGL).
2. `GET /financeapis/users`: Retrieve all users.
3. `GET /financeapis/users/:id`: Retrieve a single user by ID.
4. `POST /financeapis/users`: Create a new user.
5. `PUT /financeapis/users/:id`: Update an existing user.
6. `DELETE /financeapis/users/:id`: Delete a user and their associated transactions and portfolios.
7. `POST /financeapis/market/manipulation?event=`: Simulate market events such as bull markets and crashes. The `event` query parameter should be either `Bear` or `Bull`.
8. `POST /financeapis/stocks`: Create a new stock.
9. `GET /financeapis/stock?industry=Software`: Retrieve stocks by industry. The `industry` query parameter should be one industry of the Stocks table.

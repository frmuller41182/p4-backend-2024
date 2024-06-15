/*
This script will:
1) Create a TS class for the User Entity.
2) Fetch data from one APIs to populate the different fields of Objects of the defined Stock Class.
3) Export a function that will create "n" nuber of User Objects that will be feed into the database through the seed.ts script.

Reference Entity Schema

model User {
  userId       Int           @id @default(autoincrement())
  name         String
  alias        String
  email        String        @unique
  createdAt    DateTime      @default(now())
  transactions Transaction[]
  portfolios   Portfolio[]
}

https://randomuser.me/api?results=${n}

First we populate the independent fields of the entities (i.e., the ones which do not have any relations). 
We will tackle the ones with relations afterwards.

 */

export class User {
  constructor(
    public name: string,
    public alias: string,
    public email: string
  ) {}
}

export const getUsers = async (n: Number) => {
  const response = await fetch(`https://randomuser.me/api?results=${n}`);
  const results = (await response.json()) as { results: any[] };
  const users: Array<User> = [];
  for (const user of results.results) {
    users.push(new User(user.name.first, user.name.last, user.email));
  }
  return users;
};

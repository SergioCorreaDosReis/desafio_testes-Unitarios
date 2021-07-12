import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import createConnection from "../../../../database";

async function create() {
  const connection = await createConnection("localhost");

  const id = uuidv4();
  const password = await hash("admin", 8);

  await connection.query(
    `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
  VALUES ('${id}','admin3','admin3@admin.com','${password}', 'now()', 'now()')
     `
  );
  await connection.close();
}

create().then(() => console.log("User admin created!"));

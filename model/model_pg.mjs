import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env)

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL, //μεταβλητή περιβάλλοντος
    ssl: {
      rejectUnauthorized: false
    }
  });

// const pool = new pg.Pool();  // to connect to the local database

async function connect() {
    try {
        const client = await pool.connect();
        return client
    }
    catch(e) {
        console.error(`Failed to connect ${e}`)
    }
}

async function getMyRecipes(userID, callback) {
    // ανάκτηση όλων των βιβλίων του χρήστη από τη βάση δεδομένων
    const sql = `SELECT * FROM "recipe" WHERE "belongs_to_user_user_id" = '${userID}' ORDER BY "title";`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows) // επιστρέφει array
    }
    catch (err) {
        callback(err, null);
    }
}

//// testing
// getMyBooks(2,  (err, rows) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('.....-->', rows);
//   });

async function newRecipe (recipe, callback) {
    console.log('to insert...', recipe)
    const sql = `INSERT INTO "recipe" ("title", "img", "ingredient", "description", "time", "portions", "level") 
        VALUES ('${recipe.title}', '${recipe.img}', '${recipe.ingredient}', '${recipe.description}', '${recipe.time}', '${recipe.portions}', '${recipe.level}');`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows) // επιστρέφει array
    } 
    catch (err) {
            callback(err, null);
        }
    }

///// testing
// newBook( {"title": "the best book", "author": "me who else", "comment":"", "user": 2}, (err, rows) => {
//     if (err) {
//       return console.error(err.message);
//     } else console.log(rows)
//   });

async function findRecipe(recipeIngredient, recipeCategory, callback) {
    console.log('findRecipeWithBasicIngredient', recipeIngredient)
    const sql = `SELECT * FROM "recipe" WHERE "ingredient" = '${recipeIngredient}'`; //Add the category
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows) // επιστρέφει array
    } 
    catch (err) {
            callback(err, null);
        }
    }

// // testing
// findBook(7, (err, data) => {
//     if (err) {
//         return console.log(err)
//     }
//     else console.log(data)
// });

async function updateRecipe (recipe, callback) {
    const sql = `UPDATE "recipe"
        SET "title" = '${recipe.title}', img = '${recipe.img}', ingredient = '${recipe.ingredient}', description = '${recipe.description}', time = '${recipe.time}', portions = '${recipe.portions}', level = '${recipe.level}'
        WHERE ("recipe_id" = '${recipe.recipe_id}');`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release();
        console.log(`Row(s) updated`);
        callback(null, res.rows) // επιστρέφει array
    } 
    catch (err) {
        console.log(e);
        callback(e, null);
        }
    }

/// testing
// updateBook({"bookID":8,"title":"Another good book","author":"someone else", "comment":""}, (err, data) => {
//     if (err) {
//         console.log(err)
//     }
//     console.log(data)
// })

async function deleteRecipe (recipe, callback) {
    const sql = `DELETE FROM "recipe"
        WHERE  "recipe_id" = '${recipe.recipe_id}';`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release();
        console.log(`Recipe deleted`);
        callback(null, res.rows) // επιστρέφει array
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
        }
    }

/// testing
// deleteBook(7, (err, data) => {
//     if (err)
//         console.log(err);
//     else
//         console.log(data);
// })

// async function insertUser (userName, callback) {
//     // εισαγωγή νέου χρήστη, και επιστροφή στο callback της νέας εγγραφής
//     const sql = `INSERT INTO "user"("alias") VALUES ('${userName}') RETURNING "userID";`
//     console.log('to insert...', sql)
//     // how to return the autoincremented value of an inserted record: https://stackoverflow.com/questions/37243698/how-can-i-find-the-last-insert-id-with-node-js-and-postgresql
//     try {
//         const client = await connect();
//         const res = await client.query(sql);
//         await client.release();
//         console.log(`user inserted`);
//         callback(null, [{"userName": userName, "userID": res.rows[0].userID}]) // επιστρέφει array
//     } 
//     catch (err) {
//         console.log(err);
//         callback(err, null);
//         }
//     }

///// testing

// insertUser("Μαρικούλα", (err, data) => {
//     if (err){
//         console.log(err)
//     }
//     console.log(data);
// })
        
async function findUser(userID=null, userName=null, callback) {
    // εύρεση χρήστη με βάση τον κωδικό ή το όνομά του.
    // χωρίς μυστικό κωδικό για λόγους απλότητας
    const sql = (userID) ? `SELECT * FROM "user" WHERE "user_id" = '${userID}';` : 
    `SELECT * FROM "user" WHERE "alias" = '${userName}';`;  
    console.log('new sql...', sql) 
    try {
        const client = await connect();
        // console.log('theclient...', client)
        const res = await client.query(sql);
        if (res.rows.length === 0) {
            // αν ο χρήστης δεν υπάρχει, πρέπει να δημιουργηθεί
            await client.release();
            await insertUser(userName, (err, newUser) => {
                console.log("newuser", newUser);
                if (err) {
                    callback(err, null);
                } else
                    findUser(userID, userName, callback);
            });
        }
        else {
            console.log(`user found`);
            callback(null, [{"userName": userName || res.rows[0].userName, "userID": userID || res.rows[0].userID}]) // επιστρέφει array
        }
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
        }
}

// //// test#1
// findUser(null, "Νίκος", (err, data) => {
//     if (err){
//         console.log(err)
//     }
//     console.log(data)
// })

// //// test#2
// findUser(null, "Jhon Jhon", (err, data) => {
//     if (err){
//         console.log(err)
//     }
//     console.log(data)
// })


// const  query = (text, params, callback) => {
//     const db = new sqlite3.Database(db_name);
//     return db.query(text, params, callback)
//   }

export { getMyRecipes, newRecipe, findRecipe, updateRecipe, deleteRecipe, findUser };
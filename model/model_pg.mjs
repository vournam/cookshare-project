import pg from "pg";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL, //environment variable
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
    //retrieve all the recipes posted by the specific user from the database
    const sql = `SELECT * FROM "recipe" WHERE "belongs_to_user_user_id" = '${userID}';`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows) // returns array
    }
    catch (err) {
        callback(err, null);
    }
}

async function getAllRecipes(callback) {
    // retrieve all the recipes from the database
    const sql = `SELECT * FROM "recipe";`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows)
    }
    catch (err) {
        callback(err, null);
    }
}

async function newRecipe (recipe, userID, callback) {
    // console.log('to insert...', recipe)
    const sql = `INSERT INTO "recipe" ("belongs_to_user_user_id", "title", "category", "img", "ingredient", "description", "time", "portions", "level") 
        VALUES ('${userID}', '${recipe.title}', '${recipe.category}', '${recipe.img}', '${recipe.ingredient}', '${recipe.description}', '${recipe.time}', '${recipe.portions}', '${recipe.level}');`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows)
    } 
    catch (err) {
        callback(err, null);
    }
}

// Return all the categories, ingredients and difficulty levels for the recipes
async function recipeInfo (callback) {
    const sql1 = `SELECT * FROM "category";`;
    const sql2 = `SELECT * FROM "ingredient";`;
    const sql3 = `SELECT * FROM "level";`;
    try {
        const client = await connect();
        const res1 = await client.query(sql1)
        const res2 = await client.query(sql2)
        const res3 = await client.query(sql3)
        // console.log(res1.rows, res2.rows, res3.rows)
        await client.release()
        callback(null, res1.rows, res2.rows, res3.rows)
    } 
    catch (err) {
        callback(err, null);
    }
}

async function findRecipe(recipeIngredient, recipeCategory, callback) {
    // console.log('findRecipe with:', recipeIngredient, recipeCategory)
    const sql = `SELECT * FROM "recipe" WHERE "ingredient" = '${recipeIngredient}' AND "category" = '${recipeCategory}';`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows)
    } 
    catch (err) {
            callback(err, null);
        }
    }

async function openRecipe(recipeID, callback) {
    const sql = `SELECT * FROM "recipe" WHERE "recipe_id" = '${recipeID}' ;`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release()
        callback(null, res.rows)
    } 
    catch (err) {
        callback(err, null);
    }
}

async function updateRecipe (recipe, recipeID, callback) {
    const sql = [];
    for( let i in recipe) {
        if (recipe[i]) {
            const query = `UPDATE "recipe" SET "${i}" = '${recipe[i]}' WHERE ("recipe_id" = '${recipeID}');`;
            sql.push(query);
        }
    }
    try {
        // console.log(sql);
        for (let query in sql) {
            const client = await connect();
            const res = await client.query(sql[query])
            await client.release();
            // console.log(`Row(s) updated`);
            callback(null, res.rows)
        }  
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
        }
    }

async function deleteRecipe (recipe_id, callback) {
    const sql = `DELETE FROM "recipe" WHERE "recipe_id" = '${recipe_id}';`;
    try {
        const client = await connect();
        const res = await client.query(sql)
        await client.release();
        // console.log(`Recipe deleted`);
        callback(null, res.rows) 
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
        }
    }

async function insertUser (name, surname, alias, email, password, callback) {
    // enter a new user, and return to the callback of the new registration
    const sql1 = `SELECT * FROM "user";`
    let length;
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
        const client = await connect();
        const res = await client.query(sql1);
        await client.release();
        length = res.rows.length + 1;
        // console.log(length);
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
    }
    const sql = `INSERT INTO "user"("user_id", "name", "surname", "alias", "email", "password", "recipe_box") VALUES ('${length}', '${name}', '${surname}', '${alias}', '${email}', '${hashedPassword}', '${length}');`
    // console.log('to insert...', sql)
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        // console.log(`user inserted`);
        callback(null, [{"userName": alias}])
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
    }
}
 
async function findUser(email, password, callback) {
    // find a user based on his email and password
    const sql = `SELECT * FROM "user" WHERE "email" = '${email}';`; 
    // console.log('new sql...', sql) 
    try {
        const client = await connect();
        // console.log('theclient...', client)
        const res = await client.query(sql);
        await client.release();
        if (res.rows.length == 0) {
            // if the user's email doesn't exist
            callback("Wrong email. Try again.", null);
        }
        else {
            // console.log(`user found`);
            const check = await bcrypt.compare(password, res.rows[0].password);
            // console.log(check);
            if (check) {
                callback(null, res.rows[0]) // επιστρέφει array
            }
            else {
                //if the user's password doesn't match to that of the bcrypt database password
                callback("Wrong password. Try again.", null);
            }
            
        }
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
    }
}

// Find user based on request's userID
async function loadUser(userID, callback) {
    const sql = `SELECT * FROM "user" WHERE "user_id" = '${userID}';`; 
    // console.log('new sql...', sql) 
    try {
        const client = await connect();
        const res = await client.query(sql);
        await client.release();
        // console.log(`user found`);
        callback(null, res.rows[0])
    } 
    catch (err) {
        console.log(err);
        callback(err, null);
    }
}

export { getMyRecipes, getAllRecipes, newRecipe, recipeInfo, findRecipe, openRecipe, updateRecipe, deleteRecipe, insertUser, findUser, loadUser };
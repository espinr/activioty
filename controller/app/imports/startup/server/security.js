/* Security and permissions to access/modify the database */
import { Checkpoints } from '../../api/checkpoints/checkpoints.js';
import { Users } from '../../api/users/users.js';

//Users.permit(['insert', 'update']);



/*
// Anyone may insert, update, or remove a post without restriction



// No one may insert, update, or remove posts
Posts.permit(['insert', 'update', 'remove']).never();

// Users may insert posts only if they are logged in
Posts.permit('insert').ifLoggedIn();

// Users may remove posts only if they are logged in with an "admin" role
Posts.permit('remove').ifHasRole('admin');

// Admin users may update any properties of any post, but regular users may
// update posts only if they don't try to change the `author` or `date` properties
Posts.permit('update').ifHasRole('admin');
Posts.permit('update').ifLoggedIn().exceptProps(['author', 'date']);

*/
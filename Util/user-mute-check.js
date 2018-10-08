const fs = require('fs');

module.exports = {
/**
 * Adds username to ignored list
 * @param {string[]} list of usernames ignored already
 * @param {string} usernames to be ignored when requested
 */
  addIgnored: function (users, username) {
    users.push(username);

    fs.writeFile('./data/users.json', JSON.stringify(users), err => {
        if(err) console.error(err.message);
    });

    return true;
  },

  /**
   * removes username from ignored list
   * @param {string[]} list of usernames ignored already
   * @param {string} usernames to be removed from list
   */
    removeIgnored: function (users, username) {
     users.push(username);

     var data = fs.readFileSync('data/users.json');
     var userslist = JSON.parse(data);
     userslist.forEach((user, index) => {
       if (user === username) {
         userslist.splice(index, 1);
       }
     });
     fs.writeFileSync('data/users.json', JSON.stringify(userslist, null, 2));

     return true;
    }
}

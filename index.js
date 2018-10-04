const config = require('./config.json');
const steem = require('steem');
const https = require('https');

//check utopian posts every 5 min
setInterval(initBot, 300000);


//init bot
function initBot(){
    steem.api.getDiscussionsByCreated({"tag": "utopian-io", "limit": 1}, function(err, result) {
        if (err === null) {
            for (let discussion of result) {
                // get the last permlink and author on utopian
                getContributions(discussion.author,discussion.permlink);
            }
        } else {
            console.log(err);
        }
    });
}

//get List of contributions on utopian
function getContributions(author, permlink) {
    const url = `https://utopian.rocks/api/posts?author=`+author;
    var m_body = '';
    https.get(url, function(res) {
        res.on('data', function(chunk) {
            m_body += String(chunk);
        });
        res.on('end', function() {
            try {
                const response = JSON.parse(m_body);
                if (response.length > 0) {
                    const contributionsObj = {
                        "total": response.length,
                        "approved": 0,
                        "staff_picked": 0,
                        "total_payout": 0.0
                    };
                    contributionsObj['category'] = {};
                    contributionsObj['approved'] = response.filter(function (el) { return el.voted_on == true;});
                    contributionsObj['staff_picked'] = response.filter(function (el) { return el.staff_picked == true;});

                    contributionsObj['category']['analysis'] = response.filter(function (el) { return el.category === 'analysis' && el.voted_on === true;});
                    contributionsObj['category']['blog'] = response.filter(function (el) { return el.category === 'blog' && el.voted_on === true;});
                    contributionsObj['category']['bughunting'] = response.filter(function (el) { return el.category === 'bug-hunting' && el.voted_on === true;});
                    contributionsObj['category']['copywriting'] = response.filter(function (el) { return el.category === 'copywriting' && el.voted_on === true;});
                    contributionsObj['category']['development'] = response.filter(function (el) { return el.category === 'development' && el.voted_on === true;});
                    contributionsObj['category']['documentation'] = response.filter(function (el) { return el.category === 'documentation' && el.voted_on === true;});
                    contributionsObj['category']['graphics'] = response.filter(function (el) { return el.category === 'graphics' && el.voted_on === true;});
                    contributionsObj['category']['suggestions'] = response.filter(function (el) { return el.category === 'suggestions' && el.voted_on === true;});
                    contributionsObj['category']['taskrequests'] = response.filter(function (el) { return el.category === 'task-requests' && el.voted_on === true;});
                    contributionsObj['category']['tutorials'] = response.filter(function (el) { return el.category === 'tutorials' && el.voted_on === true;});
                    contributionsObj['category']['videotutorials'] = response.filter(function (el) { return el.category === 'video-tutorials' && el.voted_on === true;});
                    contributionsObj['category']['visibility'] = response.filter(function (el) { return el.category === 'visibility' && el.voted_on === true;});

                    response.forEach(function(contribution) {
                        if(contribution.voted_on === true){
                            contributionsObj.total_payout = contributionsObj.total_payout + contribution.total_payout;
                        }
                    });

                    for(var key in contributionsObj.category) {
                        const value = contributionsObj.category[key];
                        if(value.length == 0){
                            delete contributionsObj.category[key];
                        }
                    }

                    commentOnAuthorPost(contributionsObj, author, permlink);
                }
            } catch (e) {
                console.log('Err' + e);
            }
        });
    }).on('error', function(e) {
        req.abort();
        console.log("Got an error: ", e);
    });
}

//comment on Author post
function commentOnAuthorPost(contributions, author, permlink) {
    const str = '';
    for(const key in contributions.category) {
        const value = contributions.category[key];
        str += "<li>"+ key.replace(key[0], key[0].toUpperCase()) +"  : <strong>"+ value.length +"</strong></li>"
    }

    const contribution_category = "<ul type='square'>"+str+"</ul>";
    const payout =  "Your total payout for <strong>"+contributions.approved.length+"</strong> contributions is <strong>$ "+contributions.total_payout.toFixed(2)+"</strong>";

    const existing_contributor = "So far you've submitted <strong>"+ contributions.total +"</strong> contributions on Utopian. Keep up the good work! \n"+
                           "<p>Your <strong>"+contributions.approved.length + "</strong> contributions have been appoved and upvoted by Utopian</p><p><strong>Here is your contributions details..</strong></p>";
    const comment_body = (contributions.total > 1) ? existing_contributor+'\n'+contribution_category+'\n'+payout : "Congratulations on your first contribution to Utopian!"; // Body

    steem.broadcast.comment(
        config.wif,
        author, // parent author
        permlink, // Main tag
        'utopian-buddy', // Author
        permlink + '-utopian-post-stats', // Permlink
        '', // Title
        'Hey, '+ '@'+author+'\n'  +
        '<p><strong>Thank you for your contribution </strong></p>' +
        comment_body,
        { tags: ['utopian-io'], app: 'utopian-buddy' }, // Json Metadata
        function(err, result) {
            console.log("RESULT------->", err, result);
        }
    );
}

const router = require('express').Router();
const { User } = require('../../models');

// GET ALL USERS
router.get('/', (req, res) => {
  User.findAll({
    attributes: { exclude: ['password'] }
  })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
    User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'post_content', 'created_at']
        },
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at'],
          include: {
            model: Post,
            attributes: ['title']
          }
        },
        {
          model: Post,
          attributes: ['title'],
          through: Vote,
          as: 'voted_posts'
        }
      ]
    })
      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'Nope, try again.' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  });

  router.post('/', (req, res) => {
    // {
    //   username: 'username', 
    //   email: 'email@email.com', 
    //   password: 'password1234'
    // }
      User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      })
        .then(dbUserData => {
          req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
    
            res.json(dbUserData);
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
    });
    
    router.put('/:id', (req, res) => {
        // {
        //   username: 'username', 
        //   email: 'email@email.com', 
        //   password: 'password1234'
        // }
          User.update(req.body, {
            individualHooks: true,
            where: {
              id: req.params.id
            }
          })
            .then(dbUserData => {
              if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
              }
              res.json(dbUserData);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json(err);
            });
        });
        
        router.delete('/:id', (req, res) => {
          User.destroy({
            where: {
              id: req.params.id
            }
          })
            .then(dbUserData => {
              if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id' });
                return;
              }
              res.json(dbUserData);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json(err);
            });
        });

module.exports = router;
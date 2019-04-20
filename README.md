# project DB
DB user : admin
DB pass : admin
DB on PI

# migrate
sequelize db:migrate
sequelize db:migrate:undo

#bin/www not track
this file will not track
git update-index --assume-unchanged [<file> ...]

#bin/www track again
To undo and start tracking again (if you forgot what files were untracked, see this question):
git update-index --no-assume-unchanged [<file> ...]

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('tasks.db');

// Create the tasks table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, date TEXT, status TEXT)");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serving static files like CSS
app.set('view engine', 'ejs'); // Set EJS as view engine
app.set('views', path.join(__dirname, 'views')); // Set views directory

// Route to add a task
app.post('/add-task', (req, res) => {
  const { 'task-title': title, 'task-desc': description, 'task-date': date, 'task-status': status } = req.body;

  const stmt = db.prepare("INSERT INTO tasks (title, description, date, status) VALUES (?, ?, ?, ?)");
  stmt.run(title, description, date, status, (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error adding task');
    }

    res.redirect('/');
  });
});

// Route to get all tasks
app.get('/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error fetching tasks');
    }
    res.json(rows);
  });
});

// Route to view a task's details
app.get('/view-task/:id', (req, res) => {
  const taskId = req.params.id;
  db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, task) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error fetching task details');
    }
    res.json(task);
  });
});

// Route to delete a task
app.get('/delete-task/:id', (req, res) => {
  const taskId = req.params.id;
  db.run("DELETE FROM tasks WHERE id = ?", [taskId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error deleting task');
    }
    res.redirect('/');
  });
});

// Route to update a task
app.post('/update-task', (req, res) => {
  const { taskId, title, description, date, status } = req.body;
  db.run("UPDATE tasks SET title = ?, description = ?, date = ?, status = ? WHERE id = ?",
    [title, description, date, status, taskId], (err) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send('Error updating task');
      }
      res.redirect('/');
    });
});

// Route to render the task management view
app.get('/', (req, res) => {
  db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Error fetching tasks');
    }
    res.render('index', { tasks: rows }); // Render index.html with tasks
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});





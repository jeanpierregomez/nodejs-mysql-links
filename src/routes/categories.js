const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
  res.render('categories/add');
});

router.post('/add', async (req, res) => {
  const { title } = req.body;
  const newCategory = {
    title,
    user_id: req.user.id
  };
  await pool.query('INSERT INTO categories set ?', [newCategory]);
  req.flash('success', 'Category Saved Successfully');
  res.redirect('/categories');
});

router.get('/', isLoggedIn, async (req, res) => {
  const categories = await pool.query('SELECT * FROM categories WHERE user_id = ?', [req.user.id]);
  res.render('categories/list', { categories });
});

router.get('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE ID = ?', [id]);
    req.flash('success', 'Category Removed Successfully');
    res.redirect('/categories');
  } catch (error) {
    req.flash('error', 'Category cannot be removed, because it has related links');
    res.redirect('/categories');
  }
});

router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const categories = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  res.render('categories/edit', { category: categories[0] });
});

router.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const newCategory = {
    title
  };
  await pool.query('UPDATE categories set ? WHERE id = ?', [newCategory, id]);
  req.flash('success', 'Category Updated Successfully');
  res.redirect('/categories');
});

module.exports = router;
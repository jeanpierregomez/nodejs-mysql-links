const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', async (req, res) => {
    const categories = await pool.query('SELECT * FROM categories WHERE user_id = ?', [req.user.id]);
    res.render('links/add', { categories });
});

router.post('/add', async (req, res) => {
    const { title, url, description, category_id } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id,
        category_id
    };
    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/links');
});

router.get('/', isLoggedIn, async (req, res) => {
    const links = await pool.query(`
        SELECT l.*, c.id cId, c.title cTitle 
        FROM links l INNER JOIN categories c on (c.id = l.category_id) 
        WHERE l.user_id = ?`, [req.user.id]);
    res.render('links/list', { links });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM links WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const links = await pool.query(`
        SELECT l.*, c.id cId, c.title cTitle 
        FROM links l INNER JOIN categories c on (c.id = l.category_id) 
        WHERE l.id = ?`, [id]);
    const categories = await pool.query('SELECT * FROM categories WHERE user_id = ?', [req.user.id]);
    res.render('links/edit', { link: links[0], categories });
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const newLink = {
        title,
        description,
        url,
        category_id
    };
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links');
});

module.exports = router;
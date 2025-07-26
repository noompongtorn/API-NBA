const profile = (req, res) => {
    const userId = req.params.id;
    res.send(`User details for user ${userId}`);
}

module.exports = { login };
const resetPasswordView = (req, res) => {
    const { token } = req.query;
    res.render('reset-password', { token });
}

export default {
    resetPasswordView,
}
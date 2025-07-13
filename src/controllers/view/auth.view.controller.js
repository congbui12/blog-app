const authView = {
    resetPasswordForm: (req, res) => {
        const token = req.query.token;
        res.render('reset-password-form', { token });
    },
}

export default authView;
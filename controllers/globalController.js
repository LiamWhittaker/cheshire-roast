exports.aboutUs = (req, res) => {
  res.render('about', {title: 'About Us'});
}

exports.contact = (req, res) => {
  res.render('contact', {title: 'Contact'});
}
module.exports.home = (req, res) => {

  res.render('index', {
  	name: 'Emmanuel',
  	dog: req.query.dog,
  	title: "Home"
  });

}
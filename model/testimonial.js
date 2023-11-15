var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestimonialSchema = new Schema({
	name: { type: String, default: null },
	designation: { type: String, default: null },
	image: { type: String, default: null },
	testimonial: { type: String, default: null },
	doc: { type: Date, default: Date.now },
	dom: { type: Date, default: null }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
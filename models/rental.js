const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/rent-me', { useNewUrlParser: true});
const Schema = mongoose.Schema;

const RentalSchema = new Schema({
        neighborhood: { type: String, required: true},
        zip: { type: Number, required: true },
        type: { type: String, required: true},
        amenities: { type: String, required: true},
        price: { type: Number, required: true},
        landlord: {type: Schema.Types.ObjectId, ref: "Landlord"}
});



module.exports = mongoose.model('Rental', RentalSchema);
